import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity.js';
import { CartView } from './types/cart.types.js';
import { toCents } from '../common/money.js';
import { WorkshopSession } from '../workshop/entities/workshop-session.entity.js';

@Injectable()
export class CartService {
    private readonly cart = new Map<string, Map<string, { productId: number; sessionId?: number; quantity: number }>>();

    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(WorkshopSession)
        private readonly sessionRepository: Repository<WorkshopSession>,
    ){}

    async getCart(cartId: string): Promise<CartView> {
        const cart = this.cart.get(cartId);
        
        if (!cart || cart.size === 0) return {items: [], totalCents: 0};

        const cartLines = [...cart.values()];
        const products = await this.productRepository.find({
            where: {id: In([...new Set(cartLines.map((line) => line.productId))]), is_active: 1},
        });
        const byId = new Map(products.map((p) => [p.id, p]));
        const sessionIds = cartLines.flatMap((line) => line.sessionId ? [line.sessionId] : []);
        const sessions = sessionIds.length
            ? await this.sessionRepository.find({
                  where: { id: In(sessionIds) },
                  relations: { workshop: true },
              })
            : [];
        const sessionsById = new Map(sessions.map((session) => [session.id, session]));
        const items: CartView['items'] = [];

        for (const [key, line] of cart) {
            const product = byId.get(line.productId);
            const session = line.sessionId ? sessionsById.get(line.sessionId) : undefined;
            if (!product || (line.sessionId && (!session || session.workshop.id !== product.id))) {
                cart.delete(key);
                continue;
            }
            if (!line.sessionId && product.product_type !== 'physical') {
                cart.delete(key);
                continue;
            }
            const unitPriceCents = toCents(product.price);
            items.push({
                productId: product.id,
                ...(session ? { sessionId: session.id } : {}),
                type: product.product_type ?? 'physical',
                name: product.name,
                unitPriceCents,
                quantity: line.quantity,
                subTotalCents: unitPriceCents * line.quantity,
                ...(session
                    ? {
                          startsAt: session.starts_at,
                          durationMinutes: product.duration_minutes ?? undefined,
                          location: product.location ?? undefined,
                      }
                    : {}),
            });
        }

        const totalCents = items.reduce((sum, i) => sum + i.subTotalCents, 0);
        return { items, totalCents };
    }

    async addItem(cartId: string, productId: number, quantity: number, sessionId?: number) {
        const product = await this.findActiveProduct(productId);
        const key = this.getKey(productId, sessionId);
        const cart = this.getOrCreate(cartId);
        const previousQuantity = cart.get(key)?.quantity ?? 0;
        const newQuantity = previousQuantity + quantity;
        if (sessionId) {
            if (product.product_type !== 'workshop') {
                throw new NotFoundException('A oficina não foi encontrada');
            }
            const session = await this.findAvailableSession(sessionId, productId);
            this.assertSpots(session, newQuantity);
        } else {
            if (product.product_type === 'workshop') {
                throw new ConflictException('Selecione uma sessão para reservar a oficina');
            }
            this.assertStock(product, newQuantity);
        }
        cart.set(key, { productId, ...(sessionId ? { sessionId } : {}), quantity: newQuantity });

        return this.getCart(cartId);
    }

    async updateItem(cartId: string, productId: number, quantity: number, sessionId?: number) {
        const key = this.getKey(productId, sessionId);
        if (quantity === 0) {
            this.cart.get(cartId)?.delete(key);
            return this.getCart(cartId);
        }
        
        const product = await this.findActiveProduct(productId);
        if (sessionId) {
            const session = await this.findAvailableSession(sessionId, productId);
            this.assertSpots(session, quantity);
        } else {
            if (product.product_type === 'workshop') {
                throw new ConflictException('Selecione uma sessão para reservar a oficina');
            }
            this.assertStock(product, quantity);
        }
        this.getOrCreate(cartId).set(key, {
            productId,
            ...(sessionId ? { sessionId } : {}),
            quantity,
        });

        return this.getCart(cartId);
    }

    getRawItems(cartId: string): { productId: number; quantity: number; sessionId?: number }[] {
        const cart = this.cart.get(cartId);
        if (!cart) return [];
        return [...cart.values()];
    }

    clear(cartId: string): void {
        this.cart.delete(cartId);
    }


    private getOrCreate(cartId: string): Map<string, { productId: number; sessionId?: number; quantity: number }> {
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

    private getKey(productId: number, sessionId?: number) {
        return sessionId ? `session:${sessionId}` : `product:${productId}`;
    }

    private async findAvailableSession(sessionId: number, productId: number) {
        const session = await this.sessionRepository.findOne({
            where: { id: sessionId, workshop: { id: productId } },
            relations: { workshop: true },
        });
        if (!session || session.workshop.product_type !== 'workshop' || session.starts_at.getTime() <= Date.now()) {
            throw new NotFoundException('Sessão não encontrada ou indisponível');
        }
        return session;
    }

    private assertSpots(session: WorkshopSession, quantity: number): void {
        if (quantity > session.capacity - session.booked_count) {
            throw new ConflictException(
                `Vagas insuficientes (disponíveis: ${session.capacity - session.booked_count})`,
            );
        }
    }

    private assertStock(product: Product, quantity: number): void {
        if (quantity > product.stock) {
            throw new ConflictException(
                `Estoque insuficiente para "${product.name}" (disponível: ${product.stock})`,
            );
        }
    }
}
