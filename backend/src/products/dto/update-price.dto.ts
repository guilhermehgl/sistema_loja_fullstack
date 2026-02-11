import { IsNumber, Min } from 'class-validator';

// DTO dedicado para alteração isolada de preço.
export class UpdatePriceDto {
  @IsNumber()
  @Min(0)
  price: number;
}
