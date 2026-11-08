import { Transform } from 'class-transformer';
import { IsDate, IsInt, Min } from 'class-validator';

export class CreateWorkshopSessionDto {
  @Transform(({ value }) => new Date(value))
  @IsDate()
  starts_at: Date;

  @IsInt()
  @Min(1)
  capacity: number;
}
