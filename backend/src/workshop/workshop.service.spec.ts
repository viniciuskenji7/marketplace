import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { Product } from '../product/entities/product.entity.js';
import { WorkshopSession } from './entities/workshop-session.entity.js';
import { WorkshopService } from './workshop.service.js';

describe('WorkshopService', () => {
  let service: WorkshopService;
  let products: {
    findAndCount: ReturnType<typeof vi.fn>;
  };
  let sessions: {
    createQueryBuilder: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
    findOneBy: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    products = { findAndCount: vi.fn() };
    sessions = {
      createQueryBuilder: vi.fn(),
      find: vi.fn(),
      findOneBy: vi.fn(),
      delete: vi.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkshopService,
        { provide: getRepositoryToken(Product), useValue: products },
        { provide: getRepositoryToken(WorkshopSession), useValue: sessions },
      ],
    }).compile();
    service = module.get<WorkshopService>(WorkshopService);
  });

  it('returns available seats for each paginated workshop session', async () => {
    const workshop = {
      id: 8,
      product_type: 'workshop' as const,
      name: 'Oficina de velas',
      duration_minutes: 120,
    };
    products.findAndCount.mockResolvedValue([[workshop], 1]);
    const sessionData = [
      {
        id: 3,
        workshop,
        starts_at: new Date('2027-01-01T10:00:00Z'),
        capacity: 10,
        booked_count: 7,
      },
    ];
    const getMany = vi.fn().mockResolvedValue(sessionData);
    const orderBy = vi.fn().mockReturnValue({ getMany });
    const andWhere = vi.fn().mockReturnValue({ orderBy });
    const where = vi.fn().mockReturnValue({ andWhere });
    const innerJoinAndSelect = vi.fn().mockReturnValue({ where });
    sessions.createQueryBuilder.mockReturnValue({ innerJoinAndSelect });

    const result = await service.findAll('1', '12');

    expect(result).toMatchObject({
      total: 1,
      page: 1,
      limit: 12,
      totalPages: 1,
      items: [
        {
          id: 8,
          sessions: [{ id: 3, capacity: 10, booked_count: 7, available_spots: 3 }],
        },
      ],
    });
  });

  it('does not allow lowering session capacity below already reserved seats', async () => {
    const session = {
      id: 4,
      capacity: 8,
      booked_count: 5,
    };
    const execute = vi.fn().mockResolvedValue({ affected: 0 });
    const where = vi.fn().mockReturnValue({ execute });
    const set = vi.fn().mockReturnValue({ where });
    const update = vi.fn().mockReturnValue({ set });
    const createQueryBuilder = vi.fn().mockReturnValue({ update });
    Object.assign(sessions, { createQueryBuilder });
    sessions.findOneBy.mockResolvedValue(session);

    await expect(
      service.updateSession(4, { capacity: 4 }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(where).toHaveBeenCalledWith(
      'id = :id AND booked_count <= :capacity',
      { id: 4, capacity: 4 },
    );
  });

  it('does not delete a session that already has reservations', async () => {
    sessions.delete.mockResolvedValue({ affected: 0 });
    sessions.findOneBy.mockResolvedValue({ id: 4, booked_count: 1 });

    await expect(service.deleteSession(4)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
