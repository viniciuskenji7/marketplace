import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { ProductService } from "./product.service.js";
import { CreateProductDTO } from "./dtos/create-products.dto.js";
import { UpdateProductsDTO } from "./dtos/update-products.dto.js";

@Controller('products')
export class ProductController {
    constructor (private readonly productService: ProductService){}

    @Get()
    findAll(){
        return this.productService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.productService.findOne(id);
    }

    @Post()
    create(@Body() createProductDto: CreateProductDTO) {
        return this.productService.create(createProductDto);
    }

    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProductsDTO: UpdateProductsDTO
    ) {
        return this.productService.update(id, updateProductsDTO); 
    }

}