import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../product/entities/product.entity.js';
import { WorkshopSession } from './entities/workshop-session.entity.js';
import { WorkshopReservation } from './entities/workshop-reservation.entity.js';
import { WorkshopController } from './workshop.controller.js';
import { WorkshopService } from './workshop.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, WorkshopSession, WorkshopReservation]),
  ],
  controllers: [WorkshopController],
  providers: [WorkshopService],
  exports: [WorkshopService],
})
export class WorkshopModule {}
