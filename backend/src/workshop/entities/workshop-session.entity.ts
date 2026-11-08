import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity.js';

@Entity('workshop_sessions')
export class WorkshopSession {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'workshop_id' })
  workshop: Product;

  @Column('datetime', { precision: 6 })
  starts_at: Date;

  @Column('int', { unsigned: true })
  capacity: number;

  @Column('int', { unsigned: true, default: 0 })
  booked_count: number;

  @CreateDateColumn()
  created_at: Date;
}
