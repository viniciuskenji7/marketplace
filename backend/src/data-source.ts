import 'dotenv/config';
import { DataSource } from 'typeorm';
import { fileURLToPath } from 'node:url';
import { OrderItem } from './order_items/entities/order_item.entity.js';
import { Order } from './order/entities/order.entity.js';
import { Product } from './product/entities/product.entity.js';
import { WorkshopSession } from './workshop/entities/workshop-session.entity.js';
import { WorkshopReservation } from './workshop/entities/workshop-reservation.entity.js';

const requiredEnvironmentVariables = [
  'DB_HOST',
  'DB_USERNAME',
  'DB_DATABASE',
] as const;

for (const variable of requiredEnvironmentVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
}

const port = Number(process.env.DB_PORT);
if (!Number.isInteger(port) || port <= 0) {
  throw new Error('DB_PORT must be a positive integer.');
}

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Product, Order, OrderItem, WorkshopSession, WorkshopReservation],
  migrations: [
    fileURLToPath(new URL('./migrations/*.{js,ts}', import.meta.url)).replace(
      /\\/g,
      '/',
    ),
  ],
  synchronize: false,
});