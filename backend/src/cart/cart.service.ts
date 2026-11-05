import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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

    async addItem(cartId: string, productId: number, quantity: number) {
        const product = await this.findActiveProduct(productId);

        const cart = await this.getOrCreate(cartId);
        const newQuantity = ( cart.get(productId) ?? 0 ) + quantity;
        this.assertStock(product, newQuantity);
        cart.set(productId, newQuantity);

        return this.getCart(cartId);
    }

    async updateItem(cartId: string, productId: number, quantity: number) {
        if (quantity === 0) {
            this.cart.get(cartId)?.delete(productId);
            return this.getCart(cartId);
        }
        
        const product = await this.findActiveProduct(productId);

        const cart = this.getOrCreate(cartId);
        this.assertStock(product, quantity);
        cart.set(productId, quantity);

        return this.getCart(cartId);
    }

    getRawItems(cartId: string): { productId: number; quantity: number }[] {
        const cart = this.cart.get(cartId);
        if (!cart) return [];
        return [...cart].map(([productId, quantity]) => ({ productId, quantity }));
    }

    clear(cartId: string): void {
        this.cart.delete(cartId);
    }


    private getOrCreate(cartId: string): Map<number, number> {
        let cart = this.cart.get(cartId);
        if (!cart) {
            cart = new Map();
            this.cart.set(cartId, cart);
        }
        return cart;
    }

    private async findActiveProduct(productId: number): Promise<Product> {
        const product = await this.productRepository.findOne({
            where: { id: productId, is_active: 1 },
        });
        if (!product) throw new NotFoundException('Produto não encontrado');
        return product;
    }

    private assertStock(product: Product, quantity: number): void {
        if (quantity > product.stock) {
            throw new ConflictException(
                `Estoque insuficiente para "${product.name}" (disponível: ${product.stock})`,
            );
        }
    }
}
