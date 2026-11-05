import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity.js';
import { CartView } from './types/cart.types.js';

@Injectable()
export class CartService {

    private readonly cart = new Map<string, Map<number, number>>();

    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ){}

    async getCart(cartId: string): Promise<CartView> {
        const cart = await this.cart.get(cartId);
        
        if (!cart || cart.size === 0) return {items: [], totalCents: 0};

        const products = await this.productRepository.find({
            where: {id: In([...cart.keys()]), is_active: 1},
        });

        const byId = new Map(products.map((p) => [p.id, p]));

        const items = [];

        for (const [productId, quantity] of cart) {
            const product = byId.get(productId);

            if (!product) {
                cart.delete(productId);
                continue;
            }
            items.push({
                productId,
                name: product.name,
                unitPriceCents: product.price,
                quantity,
                subTotalCents: product.price * quantity
            });
        }

        const totalCents = items.reduce((sum, i) => sum + i.subTotalCents, 0);
        return { items, totalCents };
    }
}
