import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { CartService } from '../cart/cart.service.js';
import { MailService } from '../mail/mail.service.js';
import { CheckoutDto } from './dto/checkout.dto.js';
import { OrderItem } from '../order_items/entities/order_item.entity.js';
import { Product } from '../product/entities/product.entity.js';
import { Order } from './entities/order.entity.js';

@Injectable()
export class OrderService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly cartService: CartService,
    private readonly mailService: MailService
  ){}

  async checkout(cartId: string, dto: CheckoutDto) {
    const cartItems = this.cartService.getRawItems(cartId);
    
    if(cartItems.length === 0) {
      throw new BadRequestException('Carrinho vazio');
    }

    const sorted = [...cartItems].sort((a, b) => a.productId - b.productId);

    const order = await this.dataSource.transaction(async (manager) => {
      const items: OrderItem[] = [];
      let totalCents = 0;

      for (const { productId, quantity } of sorted) {
        await this.decrementStock(manager, productId, quantity);

        const product = await manager.findOneByOrFail(Product, { id: productId });
        const subTotalCents = product.price * quantity;
        totalCents += subTotalCents;
        
        items.push(
          manager.create(OrderItem, {
            product: { id: productId },
            product_name: product.name,
            unit_price_cents: product.price,
            quantity,
            subtotal_cents: subTotalCents
          })
        );
      }

      return manager.save(
        manager.create(Order, {
          customer_name: dto.name,
          customer_email: dto.email,
          total_cents: totalCents,
          items
        })
      );

    })

    this.cartService.clear(cartId);

    const emailSent = await this.sendConfirmation(order);

    return {
      orderId: order.id,
      items: order.items.map((i) => ({
        productId: i.product.id,
        name: i.product_name,
        unitPriceCents: i.unit_price_cents,
        quantity: i.quantity,
        subTotalCents: i.subtotal_cents
      })),
      totalCents: order.total_cents,
      emailSent,
    }

  }

  /** Baixa atômica: só altera se houver estoque suficiente */
  private async decrementStock(manager: EntityManager, productId: number, quantity: number) {
    const result = await manager.query(
      'UPDATE products SET stock = stock - ? WHERE id = ? AND is_active = 1 AND stock >= ?',
      [quantity, productId, quantity],
    );
    if (result.affectedRows === 1) return;

    // Nenhuma linha afetada: descobre o motivo para responder com clareza
    const product = await manager.findOneBy(Product, { id: productId });
    if (!product || !product.is_active) {
      throw new NotFoundException('Um dos produtos não está mais disponível');
    }
    throw new ConflictException(
      `Estoque insuficiente para "${product.name}" (disponível: ${product.stock})`,
    );
  }

  private async sendConfirmation(order: Order): Promise<boolean> {
    try {
      await this.mailService.sendOrderConfirmation(order);
      await this.dataSource.getRepository(Order).update(order.id, { email_sent_at: new Date().toDateString() });
      return true;
    } catch (error) {
      console.error(
        `Falha ao enviar e-mail do pedido ${order.id}`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }
}
