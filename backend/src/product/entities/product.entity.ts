import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

const decimalNumberTransformer = {
    to: (value: number) => value,
    from: (value: string | number) => Number(value),
};

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('enum', { enum: ['physical', 'workshop'], default: 'physical' })
    product_type?: 'physical' | 'workshop';

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

    @Column('int', { unsigned: true, nullable: true })
    duration_minutes?: number | null;

    @Column('varchar', { length: 255, nullable: true })
    location?: string | null;

    @Column('tinyint', { default: 1 })
    is_active: number;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string;
}