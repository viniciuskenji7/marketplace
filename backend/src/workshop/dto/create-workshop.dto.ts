import { IsInt, IsNumber, IsString, MaxLength, Min } from 'class-validator';

export class CreateWorkshopDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(500)
  description: string;

  @IsString()
  @MaxLength(255)
  image_url: string;

  @IsNumber()
  @Min(0.01)
  price: number;

  @IsInt()
  @Min(1)
  duration_minutes: number;

  @IsString()
  @MaxLength(255)
  location: string;
}
