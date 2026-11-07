import { Injectable, NotFoundException, Param } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity.js";
import { Repository } from "typeorm";
import { CreateProductDTO } from "./dtos/create-product.dto.js";
import { UpdateProductDTO } from "./dtos/update-product.dto.js";


@Injectable()
export class ProductService {

    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ){}

    async findAll(): Promise<Product[]> {
        return await this.productRepository.find()
    }

    async findOne(id: number): Promise<Product | null> {
        return await this.productRepository.findOneBy({id});
    }

    async create(createProductDTO: CreateProductDTO) {
        const newProduct = this.productRepository.create(createProductDTO);
        return await this.productRepository.save(newProduct);
    }
    
    async update(id: number, UpdateProductDTO: UpdateProductDTO) {
        const product = await this.productRepository.findOneBy({id});
        
        if(!product) {
            throw new NotFoundException(`O produto com id ${id} não foi encontrado`);
        }

        const updateProduct = this.productRepository.merge(product, UpdateProductDTO);

        return await this.productRepository.save(updateProduct);
    }

    async delete(id: number) {
        const product = await this.productRepository.findOneBy({id});

        if (!product) {
            throw new NotFoundException(`O produto com id ${id} não foi encontrado`);
        }

        product.is_active = 0;
        return await this.productRepository.save(product);
    }
}