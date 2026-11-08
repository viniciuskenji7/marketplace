import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderItem } from '../../order_items/entities/order_item.entity.js';
import { WorkshopSession } from './workshop-session.entity.js';

@Entity('workshop_reservations')
export class WorkshopReservation {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => OrderItem, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'order_item_id' })
  order_item: OrderItem;

  @ManyToOne(() => WorkshopSession, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'session_id' })
  session: WorkshopSession;

  @Column('int', { unsigned: true })
  participants: number;

  @Column('datetime', { precision: 6 })
  starts_at: Date;
}
