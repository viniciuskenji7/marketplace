import { Injectable } from "@nestjs/common";
import { IsDecimal, IsInt, IsOptional, IsString } from "class-validator";


@Injectable()
export class UpdateProductsDTO {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    image_url?: string;

    @IsDecimal()
    @IsOptional()
    price?: number;

    @IsInt()
    @IsOptional()
    stock?: number;
}