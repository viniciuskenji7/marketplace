import { Module } from '@nestjs/common';
import { OrderItemsService } from './order_items.service.js';
import { OrderItemsController } from './order_items.controller.js';

@Module({
  controllers: [OrderItemsController],
  providers: [OrderItemsService],
})
export class OrderItemsModule {}
