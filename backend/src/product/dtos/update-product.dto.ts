import { Injectable } from "@nestjs/common";
import { IsInt, IsNumber, IsOptional, IsString } from "class-validator";


@Injectable()
export class UpdateProductDTO {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    image_url?: string;

    @IsNumber()
    @IsOptional()
    price?: number;

    @IsInt()
    @IsOptional()
    stock?: number;
}