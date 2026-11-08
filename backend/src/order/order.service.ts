import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { CartService } from '../cart/cart.service.js';
import { MailService } from '../mail/mail.service.js';
import { CheckoutDto } from './dto/checkout.dto.js';
import { OrderItem } from '../order_items/entities/order_item.entity.js';
import { Product } from '../product/entities/product.entity.js';
import { Order } from './entities/order.entity.js';
import { toCents } from '../common/money.js';
import { WorkshopSession } from '../workshop/entities/workshop-session.entity.js';
import { WorkshopReservation } from '../workshop/entities/workshop-reservation.entity.js';

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

    const sorted = [...cartItems].sort(
      (a, b) =>
        a.productId - b.productId ||
        (a.sessionId ?? 0) - (b.sessionId ?? 0),
    );

    const order = await this.dataSource.transaction(async (manager) => {
      const items: OrderItem[] = [];
      let totalCents = 0;

      for (const { productId, quantity, sessionId } of sorted) {
        let session: WorkshopSession | null = null;
        if (sessionId) {
          session = await this.reserveSpots(manager, productId, sessionId, quantity);
        } else {
          await this.decrementStock(manager, productId, quantity);
        }

        const product = await manager.findOneByOrFail(Product, { id: productId });
        if (session && product.product_type !== 'workshop') {
          throw new NotFoundException('A oficina não foi encontrada');
        }
        if (!session && product.product_type !== 'physical') {
          throw new BadRequestException('Selecione uma sessão para reservar a oficina');
        }
        const unitPriceCents = toCents(product.price);
        const subTotalCents = unitPriceCents * quantity;
        totalCents += subTotalCents;
        
        const orderItem = manager.create(OrderItem, {
            product: { id: productId },
            workshop_session: session,
            product_name: product.name,
            unit_price_cents: unitPriceCents,
            quantity,
            subtotal_cents: subTotalCents,
            session_starts_at: session?.starts_at ?? null,
            session_duration_minutes: session ? product.duration_minutes : null,
            session_location: session ? product.location : null,
          });
        items.push(orderItem);
      }

      const savedOrder = await manager.save(
        manager.create(Order, {
          customer_name: dto.name,
          customer_email: dto.email,
          total_cents: totalCents,
          items
        })
      );
      const reservationItems = savedOrder.items.filter(
        (
          item,
        ): item is OrderItem & {
          workshop_session: WorkshopSession;
          session_starts_at: Date;
        } => Boolean(item.workshop_session && item.session_starts_at),
      );
      if (reservationItems.length) {
        await manager.save(
          reservationItems.map((orderItem) =>
            manager.create(WorkshopReservation, {
              order_item: orderItem,
              session: orderItem.workshop_session,
              participants: orderItem.quantity,
              starts_at: orderItem.session_starts_at,
            }),
          ),
        );
      }
      return savedOrder;

    })

    this.cartService.clear(cartId);

    const emailSent = await this.sendConfirmation(order);

    return {
      orderId: order.id,
      items: order.items.map((i) => ({
        productId: i.product.id,
        ...(i.workshop_session ? { sessionId: i.workshop_session.id } : {}),
        type: i.workshop_session ? 'workshop' : 'physical',
        name: i.product_name,
        unitPriceCents: i.unit_price_cents,
        quantity: i.quantity,
        subTotalCents: i.subtotal_cents,
        ...(i.workshop_session
          ? {
              startsAt: i.session_starts_at,
              durationMinutes: i.session_duration_minutes,
              location: i.session_location,
            }
          : {}),
      })),
      totalCents: order.total_cents,
      emailSent,
    }

  }

  /** Baixa atômica: só altera se houver estoque suficiente */
  private async decrementStock(manager: EntityManager, productId: number, quantity: number) {
    const result = await manager.query(
      'UPDATE products SET stock = stock - ? WHERE id = ? AND product_type = ? AND is_active = 1 AND stock >= ?',
      [quantity, productId, 'physical', quantity],
    );
    if (result.affectedRows === 1) return;

    // Nenhuma linha afetada: descobre o motivo para responder com clareza
    const product = await manager.findOneBy(Product, { id: productId });
    if (!product || !product.is_active) {
      throw new NotFoundException('Um dos produtos não está mais disponível');
    }
    if (product.product_type === 'workshop') {
      throw new BadRequestException('Selecione uma sessão para reservar a oficina');
    }

    throw new ConflictException(
      `Estoque insuficiente para "${product.name}" (disponível: ${product.stock})`,
    );
  }

  private async reserveSpots(
    manager: EntityManager,
    productId: number,
    sessionId: number,
    quantity: number,
  ): Promise<WorkshopSession> {
    const result = await manager.query(
      `UPDATE workshop_sessions AS ws
       INNER JOIN products AS p ON p.id = ws.workshop_id
       SET ws.booked_count = ws.booked_count + ?
       WHERE ws.id = ? AND ws.workshop_id = ? AND ws.starts_at > NOW(6)
         AND ws.capacity - ws.booked_count >= ?
         AND p.product_type = 'workshop' AND p.is_active = 1`,
      [quantity, sessionId, productId, quantity],
    );
    if (result.affectedRows !== 1) {
      const session = await manager.findOne(WorkshopSession, {
        where: { id: sessionId, workshop: { id: productId } },
        relations: { workshop: true },
      });
      if (!session || session.workshop.product_type !== 'workshop' || !session.workshop.is_active) {
        throw new NotFoundException('A sessão da oficina não está mais disponível');
      }
      throw new ConflictException(
        `Vagas insuficientes para "${session.workshop.name}" (disponíveis: ${session.capacity - session.booked_count})`,
      );
    }

    return manager.findOneByOrFail(WorkshopSession, { id: sessionId });
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
