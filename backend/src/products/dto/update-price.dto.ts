import { IsNumber, Min } from 'class-validator';
import { AdminPasswordDto } from './admin-password.dto';

export class UpdatePriceDto extends AdminPasswordDto {
  @IsNumber()
  @Min(0)
  price: number;
}
