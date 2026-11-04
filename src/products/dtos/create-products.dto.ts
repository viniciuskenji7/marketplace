import { IsDecimal, IsInt, IsString } from 'class-validator';

export class CreateProductDTO {
    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsString()
    image_url: string;

    @IsDecimal()
    price: number;

    @IsInt()
    stock: number;
}