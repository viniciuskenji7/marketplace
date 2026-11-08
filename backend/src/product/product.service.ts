import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity.js";
import { Like, Repository } from "typeorm";
import { CreateProductDTO } from "./dtos/create-product.dto.js";
import { UpdateProductDTO } from "./dtos/update-product.dto.js";


@Injectable()
export class ProductService {

    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ){}

    async findAll(page?: string, limit?: string, type?: string, search?: string) {
        if (type !== undefined && type !== 'physical' && type !== 'workshop') {
            throw new BadRequestException('Tipo de produto inválido');
        }
        const productType: Product['product_type'] | undefined =
            type === 'physical' || type === 'workshop' ? type : undefined;
        const query = search?.trim();
        if (query && query.length > 100) {
            throw new BadRequestException('A busca deve ter até 100 caracteres');
        }
        const baseWhere = {
            is_active: 1,
            ...(productType ? { product_type: productType } : {}),
        };
        const where = query
            ? [
                  { ...baseWhere, name: Like(`%${query}%`) },
                  { ...baseWhere, description: Like(`%${query}%`) },
              ]
            : baseWhere;
        if (page === undefined && limit === undefined && !query) {
            return this.productRepository.find({ where });
        }

        const currentPage = this.parsePositiveInteger(page, 1);
        const pageSize = Math.min(this.parsePositiveInteger(limit, 12), 100);
        const [items, total] = await this.productRepository.findAndCount({
            where,
            order: { created_at: 'DESC', id: 'DESC' },
            skip: (currentPage - 1) * pageSize,
            take: pageSize,
        });

        return {
            items,
            total,
            page: currentPage,
            limit: pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }

    async findOne(id: number): Promise<Product | null> {
        return await this.productRepository.findOneBy({id});
    }

    async create(createProductDTO: CreateProductDTO) {
        const newProduct = this.productRepository.create({
            name: createProductDTO.name,
            description: createProductDTO.description,
            image_url: createProductDTO.image_url,
            price: createProductDTO.price,
            stock: createProductDTO.stock,
            product_type: 'physical',
        });
        return await this.productRepository.save(newProduct);
    }
    
    async update(id: number, UpdateProductDTO: UpdateProductDTO) {
        const product = await this.productRepository.findOneBy({id});
        
        if(!product) {
            throw new NotFoundException(`O produto com id ${id} não foi encontrado`);
        }
        if (product.product_type === 'workshop') {
            throw new BadRequestException('Edite oficinas pela área de Oficinas');
        }

        const updateProduct = this.productRepository.merge(product, UpdateProductDTO);

        return await this.productRepository.save(updateProduct);
    }

    async delete(id: number) {
        const product = await this.productRepository.findOneBy({id});

        if (!product) {
            throw new NotFoundException(`O produto com id ${id} não foi encontrado`);
        }
        if (product.product_type === 'workshop') {
            throw new BadRequestException('Gerencie oficinas pela área de Oficinas');
        }

        product.is_active = 0;
        return await this.productRepository.save(product);
    }

    private parsePositiveInteger(value: string | undefined, fallback: number): number {
        if (value === undefined) return fallback;
        const parsed = Number(value);
        if (!Number.isSafeInteger(parsed) || parsed < 1) {
            throw new BadRequestException('Parâmetros de paginação inválidos');
        }
        return parsed;
    }
}