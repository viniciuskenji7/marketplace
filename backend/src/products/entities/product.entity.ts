import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('products')
export class Products {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { length: 255 })
    name: string;

    @Column('varchar', { length: 500 })
    description: string;

    @Column('varchar', { length: 255 })
    image_url: string;

    @Column('decimal', {precision: 10, scale: 2})
    price: number;

    @Column('int', { unsigned: true, default: 0 })
    stock: number;

    @Column('tinyint', { default: 1 })
    is_active: number;

    @CreateDateColumn('datetime')
    created_at: Date;

    @UpdateDateColumn('datetime')
    updated_at: Date;
}