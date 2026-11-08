import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Product } from '../product/entities/product.entity.js';
import { WorkshopSession } from '../workshop/entities/workshop-session.entity.js';
import { CartService } from './cart.service.js';

describe('CartService', () => {
  let service: CartService;
  let productRepository: {
    find: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
  };
  let product: Product;

  beforeEach(async () => {
    product = {
      id: 1,
      product_type: 'physical',
      name: 'Caneca',
      description: 'Caneca de cerâmica',
      image_url: '/caneca.png',
      price: 19.99,
      stock: 10,
      is_active: 1,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    };
    productRepository = {
      find: vi.fn().mockResolvedValue([product]),
      findOne: vi.fn().mockResolvedValue(product),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getRepositoryToken(Product),
          useValue: productRepository,
        },
        {
          provide: getRepositoryToken(WorkshopSession),
          useValue: { find: vi.fn().mockResolvedValue([]), findOne: vi.fn() },
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('soma a quantidade ao adicionar o mesmo produto novamente', async () => {
    await service.addItem('cart-1', product.id, 2);
    const cart = await service.addItem('cart-1', product.id, 3);

    expect(service.getRawItems('cart-1')).toEqual([
      { productId: product.id, quantity: 5 },
    ]);
    expect(cart.items[0].quantity).toBe(5);
  });

  it('define a quantidade ao atualizar um item', async () => {
    await service.addItem('cart-1', product.id, 2);
    const cart = await service.updateItem('cart-1', product.id, 6);

    expect(service.getRawItems('cart-1')).toEqual([
      { productId: product.id, quantity: 6 },
    ]);
    expect(cart.items[0].quantity).toBe(6);
  });

  it('remove o item quando a quantidade atualizada é zero', async () => {
    await service.addItem('cart-1', product.id, 2);
    const cart = await service.updateItem('cart-1', product.id, 0);

    expect(service.getRawItems('cart-1')).toEqual([]);
    expect(cart).toEqual({ items: [], totalCents: 0 });
  });

  it('calcula subtotais e total em centavos', async () => {
    const secondProduct: Product = {
      id: 2,
      product_type: 'physical',
      name: 'Chaveiro',
      description: 'Chaveiro de cerâmica',
      image_url: '/chaveiro.png',
      price: 2.5,
      stock: 20,
      is_active: 1,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    };
    productRepository.find.mockResolvedValue([product, secondProduct]);

    await service.addItem('cart-1', product.id, 2);
    await service.addItem('cart-1', secondProduct.id, 3);
    const cart = await service.getCart('cart-1');

    expect(cart.items).toEqual([
      {
        productId: product.id,
        type: 'physical',
        name: product.name,
        unitPriceCents: 1999,
        quantity: 2,
        subTotalCents: 3998,
      },
      {
        productId: secondProduct.id,
        type: 'physical',
        name: secondProduct.name,
        unitPriceCents: 250,
        quantity: 3,
        subTotalCents: 750,
      },
    ]);
    expect(cart.totalCents).toBe(4748);
  });
});
