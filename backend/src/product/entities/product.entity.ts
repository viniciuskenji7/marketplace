import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

const decimalNumberTransformer = {
    to: (value: number) => value,
    from: (value: string | number) => Number(value),
};

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { length: 255 })
    name: string;

    @Column('varchar', { length: 500 })
    description: string;

    @Column('varchar', { length: 255 })
    image_url: string;

    @Column('decimal', {
        precision: 10,
        scale: 2,
        transformer: decimalNumberTransformer,
    })
    price: number;

    @Column('int', { unsigned: true, default: 0 })
    stock: number;

    @Column('tinyint', { default: 1 })
    is_active: number;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string;
}