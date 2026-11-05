import { IsDecimal, IsInt, IsString, Min } from 'class-validator';

export class CreateProductDTO {
    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsString()
    image_url: string;

    @IsDecimal()
    @Min(0)
    price: number;

    @IsInt()
    stock: number;
}