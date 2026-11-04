import { Body, Controller, Get, Post } from "@nestjs/common";
import { ProductService } from "./product.service.js";
import { CreateProductDTO } from "./dtos/create-products.dto.js";



@Controller('products')
export class ProductController {
    constructor (private readonly productService: ProductService){}

    @Get()
    findAll(){
        return this.productService.findAll();
    }

    @Get()

    @Post()
    async create(@Body() createProductDto: CreateProductDTO) {
        this.productService.create(createProductDto);
    }

}