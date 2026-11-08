import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import mysql, { type Connection } from 'mysql2/promise';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CartService } from '../cart/cart.service.js';
import { MailService } from '../mail/mail.service.js';
import { Order } from './entities/order.entity.js';
import { OrderItem } from '../order_items/entities/order_item.entity.js';
import { Product } from '../product/entities/product.entity.js';
import { OrderService } from './order.service.js';

describe('OrderService stock concurrency (MySQL)', () => {
  let adminConnection: Connection;
  let dataSource: DataSource;
  let testDatabase: string;
  let testDatabaseCreated = false;

  beforeAll(async () => {
    const host = process.env.DB_HOST;
    const username = process.env.DB_USERNAME;
    const database = process.env.DB_DATABASE;
    const port = Number(process.env.DB_PORT);

    if (!host || !username || !database || !Number.isInteger(port) || port <= 0) {
      throw new Error(
        'Set DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, and DB_DATABASE to run the MySQL concurrency test.',
      );
    }

    adminConnection = await mysql.createConnection({
      host,
      port,
      user: username,
      password: process.env.DB_PASSWORD,
      database,
      connectTimeout: 10_000,
    });

    testDatabase = `marketplace_concurrency_${randomUUID().replaceAll('-', '')}`;
    await adminConnection.query(`CREATE DATABASE \`${testDatabase}\``);
    testDatabaseCreated = true;

    dataSource = new DataSource({
      type: 'mysql',
      host,
      port,
      username,
      password: process.env.DB_PASSWORD,
      database: testDatabase,
      entities: [Product, Order, OrderItem],
      synchronize: true,
      logging: false,
    });

    await dataSource.initialize();
  }, 30_000);

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }

    if (adminConnection) {
      try {
        if (testDatabaseCreated) {
          await adminConnection.query(`DROP DATABASE \`${testDatabase}\``);
        }
      } finally {
        await adminConnection.end();
      }
    }
  }, 30_000);

  it(
    'allows only one of 20 simultaneous checkouts to buy the last item',
    async () => {
      const product = await dataSource.getRepository(Product).save(
        dataSource.getRepository(Product).create({
          name: 'Concurrency test product',
          description: 'Temporary product for atomic stock test',
          image_url: 'test://concurrency',
          price: 12.5,
          stock: 1,
          is_active: 1,
        }),
      );

      const cartService = new CartService(dataSource.getRepository(Product));
      const cartIds = Array.from(
        { length: 20 },
        (_, index) => `concurrency-test-${index}`,
      );
      await Promise.all(
        cartIds.map((cartId) => cartService.addItem(cartId, product.id, 1)),
      );
      const mailService = new MailService(
        new ConfigService({ RESEND_API_KEY: 're_test' }),
      );
      const sendOrderConfirmation = vi
        .spyOn(mailService, 'sendOrderConfirmation')
        .mockResolvedValue(undefined);
      const orderService = new OrderService(
        dataSource,
        cartService,
        mailService,
      );

      const attempts = await Promise.allSettled(
        cartIds.map((cartId, index) =>
          orderService.checkout(cartId, {
            name: `Concurrent buyer ${index}`,
            email: `buyer${index}@example.test`,
          }),
        ),
      );

      const succeeded = attempts.filter(
        (attempt) => attempt.status === 'fulfilled',
      );
      const rejected = attempts.filter(
        (attempt) => attempt.status === 'rejected',
      );
      const conflicts = rejected.filter(
        (attempt) => attempt.reason?.getStatus?.() === 409,
      );
      const otherFailures = rejected.length - conflicts.length;
      const remainingProduct = await dataSource
        .getRepository(Product)
        .findOneByOrFail({ id: product.id });

      expect(succeeded).toHaveLength(1);
      expect(conflicts).toHaveLength(19);
      expect(otherFailures).toBe(0);
      expect(remainingProduct.stock).toBe(0);
      expect(await dataSource.getRepository(Order).count()).toBe(1);
      expect(await dataSource.getRepository(OrderItem).count()).toBe(1);
      expect(sendOrderConfirmation).toHaveBeenCalledTimes(1);
    },
    30_000,
  );
});
