import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Product } from './entities/product.entity.js';
import { ProductService } from './product.service.js';

describe('ProductService', () => {
  let service: ProductService;
  const productRepository = {
    find: vi.fn(),
    findAndCount: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: getRepositoryToken(Product), useValue: productRepository },
      ],
    }).compile();
    service = module.get<ProductService>(ProductService);
  });

  it('paginates and searches within the requested product type', async () => {
    productRepository.findAndCount.mockResolvedValue([[{ id: 5 }], 1]);

    const result = await service.findAll('2', '8', 'physical', 'caneca');

    expect(productRepository.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 8,
        take: 8,
        order: { created_at: 'DESC', id: 'DESC' },
        where: [
          expect.objectContaining({
            product_type: 'physical',
            name: expect.anything(),
          }),
          expect.objectContaining({
            product_type: 'physical',
            description: expect.anything(),
          }),
        ],
      }),
    );
    expect(result).toMatchObject({
      items: [{ id: 5 }],
      total: 1,
      page: 2,
      limit: 8,
      totalPages: 1,
    });
  });

  it('rejects invalid pagination and product type parameters', async () => {
    await expect(service.findAll('0', '12')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.findAll('1', '12', 'service')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
