import { Module } from '@nestjs/common';
import { CartService } from './cart.service.js';
import { CartController } from './cart.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../product/entities/product.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService]
})
export class CartModule {}
