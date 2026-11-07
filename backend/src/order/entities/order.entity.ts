import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OrderItem } from "../../order_items/entities/order_item.entity.js";


@Entity('order')
export class Order {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @OneToMany(() => OrderItem, (item) => item.order, { cascade: ['insert'] })
    items: OrderItem[];

    @Column('varchar', { length: 120 })
    customer_name: string;

    @Column('varchar', { length: 255 })
    customer_email: string;

    @Column('int', { unsigned: true })
    total_cents: number;

    @CreateDateColumn()
    email_sent_at: string;
    
    @CreateDateColumn()
    created_at: string;
}
