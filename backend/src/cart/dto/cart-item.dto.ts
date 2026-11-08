import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class AddCartItemDto {
  @IsInt() 
  @Min(1)
  productId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  sessionId?: number;

  @IsInt() 
  @Min(1) 
  @Max(99)
  quantity: number;
}

export class UpdateCartItemDto {
  @IsInt() 
  @Min(1)
  productId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  sessionId?: number;

  @IsInt() 
  @Min(0) 
  @Max(99)
  quantity: number;
}