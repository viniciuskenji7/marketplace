import { Module } from '@nestjs/common';
import { OrderService } from './order.service.js';
import { OrderController } from './order.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity.js';
import { OrderItem } from '../order_items/entities/order_item.entity.js';
import { Product } from '../product/entities/product.entity.js';
import { CartModule } from '../cart/cart.module.js';
import { MailModule } from '../mail/mail.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product]), CartModule, MailModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
