import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "../../order/entities/order.entity.js";
import { Product } from "../../product/entities/product.entity.js";

@Entity('order_item')
export class OrderItem {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @ManyToOne(() => Product, { onDelete: 'RESTRICT', nullable: false })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column('varchar', {length: 120})
    product_name: string;

    @Column('int', {unsigned: true})
    unit_price_cents: number;

    @Column('int', {unsigned: true})
    quantity: number;

    @Column('int', {unsigned: true})
    subtotal_cents: number;

}
