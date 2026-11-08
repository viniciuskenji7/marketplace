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
import { WorkshopSession } from '../workshop/entities/workshop-session.entity.js';
import { WorkshopReservation } from '../workshop/entities/workshop-reservation.entity.js';
import { OrderService } from './order.service.js';
import { Init1700000000000 } from '../migrations/1700000000000-Init.js';
import { AddWorkshops1762560000000 } from '../migrations/1762560000000-AddWorkshops.js';

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
      entities: [Product, Order, OrderItem, WorkshopSession, WorkshopReservation],
      migrations: [Init1700000000000, AddWorkshops1762560000000],
      migrationsRun: true,
      synchronize: false,
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

      const cartService = new CartService(
        dataSource.getRepository(Product),
        dataSource.getRepository(WorkshopSession),
      );
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

  it(
    'allows only one of 20 simultaneous checkouts to reserve the last workshop spot',
    async () => {
      const ordersBefore = await dataSource.getRepository(Order).count();
      const itemsBefore = await dataSource.getRepository(OrderItem).count();
      const physicalProduct = await dataSource.getRepository(Product).save(
        dataSource.getRepository(Product).create({
          name: 'Concurrency test mug',
          description: 'Physical item bundled with workshop reservation',
          image_url: 'test://mug',
          price: 20,
          stock: 20,
          product_type: 'physical',
          is_active: 1,
        }),
      );
      const product = await dataSource.getRepository(Product).save(
        dataSource.getRepository(Product).create({
          name: 'Concurrency test workshop',
          description: 'Temporary workshop for atomic reservation test',
          image_url: 'test://workshop',
          price: 45,
          stock: 0,
          product_type: 'workshop',
          duration_minutes: 90,
          location: 'Ateliê de teste',
          is_active: 1,
        }),
      );
      const session = await dataSource.getRepository(WorkshopSession).save(
        dataSource.getRepository(WorkshopSession).create({
          workshop: product,
          starts_at: new Date(Date.now() + 60 * 60 * 1000),
          capacity: 1,
          booked_count: 0,
        }),
      );
      const cartService = new CartService(
        dataSource.getRepository(Product),
        dataSource.getRepository(WorkshopSession),
      );
      const cartIds = Array.from(
        { length: 20 },
        (_, index) => `workshop-concurrency-test-${index}`,
      );
      await Promise.all(
        cartIds.map(async (cartId) => {
          await cartService.addItem(cartId, physicalProduct.id, 1);
          await cartService.addItem(cartId, product.id, 1, session.id);
        }),
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
            name: `Workshop buyer ${index}`,
            email: `workshop${index}@example.test`,
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
      const remainingSession = await dataSource
        .getRepository(WorkshopSession)
        .findOneByOrFail({ id: session.id });
      const remainingProduct = await dataSource
        .getRepository(Product)
        .findOneByOrFail({ id: physicalProduct.id });
      const latestOrder = await dataSource.getRepository(Order).find({
        order: { created_at: 'DESC' },
        take: 1,
      });

      expect(succeeded).toHaveLength(1);
      expect(conflicts).toHaveLength(19);
      expect(otherFailures).toBe(0);
      expect(remainingSession.booked_count).toBe(1);
      expect(remainingProduct.stock).toBe(19);
      expect(await dataSource.getRepository(Order).count()).toBe(ordersBefore + 1);
      expect(await dataSource.getRepository(OrderItem).count()).toBe(itemsBefore + 2);
      expect(await dataSource.getRepository(WorkshopReservation).count()).toBe(1);
      expect(latestOrder[0].total_cents).toBe(6500);
      const successfulCheckout = attempts.find(
        (attempt) => attempt.status === 'fulfilled',
      );
      if (successfulCheckout?.status === 'fulfilled') {
        expect(successfulCheckout.value.items).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ type: 'physical', productId: physicalProduct.id }),
            expect.objectContaining({
              type: 'workshop',
              productId: product.id,
              sessionId: session.id,
              durationMinutes: 90,
              location: 'Ateliê de teste',
              quantity: 1,
              startsAt: expect.any(Date),
            }),
          ]),
        );
      }
      expect(sendOrderConfirmation).toHaveBeenCalledTimes(1);
    },
    30_000,
  );
});
