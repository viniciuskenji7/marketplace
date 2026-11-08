
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length, MaxLength } from 'class-validator';

export class CheckoutDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'O nome deve ser um texto.' })
  @Length(2, 120, {
    message: 'O nome deve ter entre 2 e 120 caracteres.',
  })
  name: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Informe um endereço de e-mail válido.' })
  @MaxLength(255, {
    message: 'O e-mail deve ter no máximo 255 caracteres.',
  })
  email: string;
}