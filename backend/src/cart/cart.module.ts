import { Module } from '@nestjs/common';
import { CartService } from './cart.service.js';
import { CartController } from './cart.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../product/entities/product.entity.js';
import { WorkshopSession } from '../workshop/entities/workshop-session.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Product, WorkshopSession])],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService]
})
export class CartModule {}
