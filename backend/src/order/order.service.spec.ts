import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager } from 'typeorm';
import { CartService } from '../cart/cart.service.js';
import { MailService } from '../mail/mail.service.js';
import { Product } from '../product/entities/product.entity.js';
import { Order } from './entities/order.entity.js';
import { CheckoutDto } from './dto/checkout.dto.js';
import { OrderService } from './order.service.js';

describe('OrderService', () => {
  let service: OrderService;
  let dataSource: { transaction: ReturnType<typeof vi.fn>; getRepository: ReturnType<typeof vi.fn> };
  let cartService: { getRawItems: ReturnType<typeof vi.fn>; clear: ReturnType<typeof vi.fn> };
  let mailService: { sendOrderConfirmation: ReturnType<typeof vi.fn> };

  const checkoutDto: CheckoutDto = {
    name: 'Cliente',
    email: 'cliente@example.com',
  };

  beforeEach(async () => {
    dataSource = {
      transaction: vi.fn(),
      getRepository: vi.fn().mockReturnValue({
        update: vi.fn().mockResolvedValue({ affected: 1 }),
      }),
    };
    cartService = {
      getRawItems: vi.fn(),
      clear: vi.fn(),
    };
    mailService = {
      sendOrderConfirmation: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: DataSource, useValue: dataSource },
        { provide: CartService, useValue: cartService },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('returns 409 and does not save an order when stock is insufficient', async () => {
    const product: Product = {
      id: 1,
      name: 'Caneca',
      description: 'Caneca de cerâmica',
      image_url: '/caneca.png',
      price: 19.99,
      stock: 1,
      is_active: 1,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    };
    const manager = {
      query: vi.fn().mockResolvedValue({ affectedRows: 0 }),
      findOneBy: vi.fn().mockResolvedValue(product),
      findOneByOrFail: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
    };
    dataSource.transaction.mockImplementation(
      async (callback: (manager: EntityManager) => Promise<unknown>) =>
        callback(manager as unknown as EntityManager),
    );
    cartService.getRawItems.mockReturnValue([{ productId: product.id, quantity: 2 }]);

    const error = await service.checkout('cart-1', checkoutDto).catch((value: unknown) => value);

    expect(error).toBeInstanceOf(ConflictException);
    expect((error as ConflictException).getStatus()).toBe(409);
    expect(manager.save).not.toHaveBeenCalled();
    expect(cartService.clear).not.toHaveBeenCalled();
    expect(mailService.sendOrderConfirmation).not.toHaveBeenCalled();
  });

  it('saves the order and items, decrements stock, and returns cent totals', async () => {
    const products: Product[] = [
      {
        id: 1,
        name: 'Caneca',
        description: 'Caneca de cerâmica',
        image_url: '/caneca.png',
        price: 19.99,
        stock: 10,
        is_active: 1,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 2,
        name: 'Chaveiro',
        description: 'Chaveiro simples',
        image_url: '/chaveiro.png',
        price: 2.5,
        stock: 20,
        is_active: 1,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
    ];
    const manager = {
      query: vi.fn().mockResolvedValue({ affectedRows: 1 }),
      findOneBy: vi.fn(),
      findOneByOrFail: vi
        .fn()
        .mockImplementation(async (_entity: typeof Product, where: { id: number }) =>
          products.find((product) => product.id === where.id),
        ),
      create: vi.fn((_entity: typeof Order, values: Record<string, unknown>) => values),
      save: vi.fn(async (order: Record<string, unknown>) => ({
        ...order,
        id: 'order-1',
      })),
    };
    dataSource.transaction.mockImplementation(
      async (callback: (manager: EntityManager) => Promise<unknown>) =>
        callback(manager as unknown as EntityManager),
    );
    cartService.getRawItems.mockReturnValue([
      { productId: 2, quantity: 3 },
      { productId: 1, quantity: 2 },
    ]);

    const result = await service.checkout('cart-1', checkoutDto);

    expect(manager.query).toHaveBeenCalledTimes(2);
    expect(manager.query).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      [2, 1, 2],
    );
    expect(manager.query).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      [3, 2, 3],
    );
    expect(manager.save).toHaveBeenCalledTimes(1);
    const savedOrder = manager.save.mock.calls[0][0] as {
      customer_name: string;
      customer_email: string;
      total_cents: number;
      items: Array<{
        product_name: string;
        unit_price_cents: number;
        quantity: number;
        subtotal_cents: number;
      }>;
    };
    expect(savedOrder).toMatchObject({
      customer_name: checkoutDto.name,
      customer_email: checkoutDto.email,
      total_cents: 4748,
      items: [
        {
          product_name: 'Caneca',
          unit_price_cents: 1999,
          quantity: 2,
          subtotal_cents: 3998,
        },
        {
          product_name: 'Chaveiro',
          unit_price_cents: 250,
          quantity: 3,
          subtotal_cents: 750,
        },
      ],
    });
    expect(result).toMatchObject({
      orderId: 'order-1',
      totalCents: 4748,
      emailSent: true,
      items: [
        {
          productId: 1,
          name: 'Caneca',
          unitPriceCents: 1999,
          quantity: 2,
          subTotalCents: 3998,
        },
        {
          productId: 2,
          name: 'Chaveiro',
          unitPriceCents: 250,
          quantity: 3,
          subTotalCents: 750,
        },
      ],
    });
    expect(cartService.clear).toHaveBeenCalledWith('cart-1');
    expect(mailService.sendOrderConfirmation).toHaveBeenCalledTimes(1);
  });
});
