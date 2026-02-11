import { IsInt, IsNumber, IsString, Length, Min } from 'class-validator';

// Payload de entrada para criação de produtos e reposição de estoque.
export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @Length(8, 8)
  barcode: string;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}
