import { Injectable, NotFoundException, Param } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Products } from "./entities/product.entity.js";
import { Repository } from "typeorm";
import { CreateProductDTO } from "./dtos/create-products.dto.js";
import { UpdateProductsDTO } from "./dtos/update-products.dto.js";


@Injectable()
export class ProductService {

    constructor(
        @InjectRepository(Products)
        private readonly productsRepository: Repository<Products>,
    ){}

    async findAll(): Promise<Products[]> {
        return await this.productsRepository.find()
    }

    async findOne(id: number): Promise<Products | null> {
        return await this.productsRepository.findOneBy({id});
    }

    async create(createProductDTO: CreateProductDTO) {
        const newProduct = this.productsRepository.create(createProductDTO);
        return await this.productsRepository.save(newProduct);
    }
    
    async update(id: number, updateProductsDTO: UpdateProductsDTO) {
        const product = await this.productsRepository.findOneBy({id});
        
        if(!product) {
            throw new NotFoundException(`O produto com id ${id} não foi encontrado`);
        }

        const updateProduct = this.productsRepository.merge(product, updateProductsDTO);

        return await this.productsRepository.save(updateProduct);
    }
}