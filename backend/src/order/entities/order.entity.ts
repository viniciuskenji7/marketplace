import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity('order')
export class Order {
    @PrimaryGeneratedColumn()
    id: string;

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
