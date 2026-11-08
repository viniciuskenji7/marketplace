import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity.js';
import { CreateWorkshopDto } from './dto/create-workshop.dto.js';
import { CreateWorkshopSessionDto } from './dto/create-workshop-session.dto.js';
import { UpdateWorkshopDto } from './dto/update-workshop.dto.js';
import { UpdateWorkshopSessionDto } from './dto/update-workshop-session.dto.js';
import { WorkshopSession } from './entities/workshop-session.entity.js';

@Injectable()
export class WorkshopService {
  constructor(
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
    @InjectRepository(WorkshopSession)
    private readonly sessions: Repository<WorkshopSession>,
  ) {}

  async findAll(page = '1', limit = '12') {
    const currentPage = this.parsePositiveInteger(page, 1);
    const pageSize = Math.min(this.parsePositiveInteger(limit, 12), 100);
    const [workshops, total] = await this.products.findAndCount({
      where: { product_type: 'workshop', is_active: 1 },
      order: { created_at: 'DESC', id: 'DESC' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });

    const sessions = workshops.length
      ? await this.sessions
          .createQueryBuilder('session')
          .innerJoinAndSelect('session.workshop', 'workshop')
          .where('workshop.id IN (:...workshopIds)', {
            workshopIds: workshops.map((workshop) => workshop.id),
          })
          .andWhere('session.starts_at > CURRENT_TIMESTAMP(6)')
          .orderBy('session.starts_at', 'ASC')
          .getMany()
      : [];
    const byWorkshop = new Map<number, WorkshopSession[]>();
    for (const session of sessions) {
      const workshopId = session.workshop.id;
      const grouped = byWorkshop.get(workshopId) ?? [];
      grouped.push(session);
      byWorkshop.set(workshopId, grouped);
    }

    return {
      items: workshops.map((workshop) => Object.assign(workshop, {
        sessions: (byWorkshop.get(workshop.id) ?? []).map((session) => ({
          id: session.id,
          starts_at: session.starts_at,
          duration_minutes: workshop.duration_minutes,
          capacity: session.capacity,
          booked_count: session.booked_count,
          available_spots: session.capacity - session.booked_count,
        })),
      })),
      total,
      page: currentPage,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async create(dto: CreateWorkshopDto) {
    return this.products.save(
      this.products.create({
        name: dto.name,
        description: dto.description,
        image_url: dto.image_url,
        price: dto.price,
        duration_minutes: dto.duration_minutes,
        location: dto.location,
        product_type: 'workshop',
        stock: 0,
        is_active: 1,
      }),
    );
  }

  async update(id: number, dto: UpdateWorkshopDto) {
    const workshop = await this.findWorkshop(id);
    return this.products.save(this.products.merge(workshop, dto));
  }

  async findSessions(workshopId: number) {
    const workshop = await this.findWorkshop(workshopId);
    const sessions = await this.sessions.find({
      where: { workshop: { id: workshop.id } },
      order: { starts_at: 'ASC' },
    });
    return sessions.map((session) => ({
      id: session.id,
      starts_at: session.starts_at,
      duration_minutes: workshop.duration_minutes,
      capacity: session.capacity,
      booked_count: session.booked_count,
      available_spots: session.capacity - session.booked_count,
    }));
  }

  async createSession(workshopId: number, dto: CreateWorkshopSessionDto) {
    const workshop = await this.findWorkshop(workshopId);
    this.assertFuture(dto.starts_at);
    return this.sessions.save(
      this.sessions.create({
        workshop,
        starts_at: dto.starts_at,
        capacity: dto.capacity,
        booked_count: 0,
      }),
    );
  }

  async updateSession(id: number, dto: UpdateWorkshopSessionDto) {
    const session = await this.sessions.findOneBy({ id });
    if (!session) throw new NotFoundException('Sessão não encontrada');
    if (dto.starts_at) this.assertFuture(dto.starts_at);
    const sameStart =
      dto.starts_at === undefined ||
      new Date(dto.starts_at).getTime() === new Date(session.starts_at).getTime();
    const sameCapacity =
      dto.capacity === undefined || dto.capacity === session.capacity;
    if (!sameStart && session.booked_count > 0) {
      throw new ConflictException(
        'Não é possível alterar o horário de uma sessão com reservas',
      );
    }
    if (sameStart && sameCapacity) return session;

    const result = await this.sessions
      .createQueryBuilder()
      .update(WorkshopSession)
      .set({
        ...(dto.starts_at !== undefined ? { starts_at: dto.starts_at } : {}),
        ...(dto.capacity !== undefined ? { capacity: dto.capacity } : {}),
      })
      .where(
        !sameStart
          ? 'id = :id AND booked_count = 0'
          : 'id = :id AND booked_count <= :capacity',
        !sameStart
          ? { id }
          : { id, capacity: dto.capacity ?? session.capacity },
      )
      .execute();
    if (result.affected === 0) {
      const current = await this.sessions.findOneBy({ id });
      if (!current) throw new NotFoundException('Sessão não encontrada');
      if (!sameStart) {
        throw new ConflictException(
          'Não é possível alterar o horário de uma sessão com reservas',
        );
      }
      throw new ConflictException(
        'A capacidade não pode ser menor que as vagas já reservadas',
      );
    }
    return this.sessions.findOneByOrFail({ id });
  }

  async deleteSession(id: number) {
    const result = await this.sessions.delete({ id, booked_count: 0 });
    if (result.affected === 0) {
      const session = await this.sessions.findOneBy({ id });
      if (!session) throw new NotFoundException('Sessão não encontrada');
      throw new ConflictException('Não é possível excluir uma sessão com reservas');
    }
    return { deleted: true };
  }

  async findWorkshop(id: number) {
    const workshop = await this.products.findOneBy({
      id,
      product_type: 'workshop',
      is_active: 1,
    });
    if (!workshop) throw new NotFoundException('Oficina não encontrada');
    return workshop;
  }

  private assertFuture(date: Date) {
    if (!Number.isFinite(date.getTime()) || date.getTime() <= Date.now()) {
      throw new BadRequestException('A data da sessão deve ser futura');
    }
  }

  private parsePositiveInteger(value: string, fallback: number) {
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed) || parsed < 1) {
      throw new BadRequestException('Parâmetros de paginação inválidos');
    }
    return parsed || fallback;
  }
}
