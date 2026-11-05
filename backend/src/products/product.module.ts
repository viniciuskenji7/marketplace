import { Module } from "@nestjs/common";
import { ProductController } from "./product.controller.js";
import { ProductService } from "./product.service.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Products } from "./entities/product.entity.js";



@Module({
    imports: [TypeOrmModule.forFeature([Products])],
    controllers: [ProductController],
    providers: [ProductService]
})
export class ProductModule {};