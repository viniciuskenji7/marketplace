import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { ProductService } from "./product.service.js";
import { CreateProductDTO } from "./dtos/create-product.dto.js";
import { UpdateProductDTO } from "./dtos/update-product.dto.js";

@Controller('product')
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
        @Body() UpdateProductDTO: UpdateProductDTO
    ) {
        return this.productService.update(id, UpdateProductDTO); 
    }

    @Delete(':id')
    delete(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.productService.delete(id);
    }
}