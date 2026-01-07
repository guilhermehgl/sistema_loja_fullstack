import { IsNumber, Min } from 'class-validator';

export class UpdatePriceDto {
  @IsNumber()
  @Min(0)
  price: number;
}
