import { IsInt, IsNotEmpty, IsNumber, IsString, Length, MaxLength, Min } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Nome é obrigatório.' })
  @IsString()
  @MaxLength(30, { message: 'Nome deve ter no máximo 30 caracteres.' })
  name: string;

  @IsNotEmpty({ message: 'Código de barras é obrigatório.' })
  @IsString()
  @Length(8, 8, { message: 'Código de barras deve conter exatamente 8 dígitos.' })
  barcode: string;

  @IsNotEmpty({ message: 'Quantidade é obrigatória.' })
  @IsInt()
  @Min(0, { message: 'Quantidade deve ser maior ou igual a zero.' })
  quantity: number;

  @IsNotEmpty({ message: 'Preço é obrigatório.' })
  @IsNumber()
  @Min(0, { message: 'Preço deve ser maior ou igual a zero.' })
  price: number;
}
