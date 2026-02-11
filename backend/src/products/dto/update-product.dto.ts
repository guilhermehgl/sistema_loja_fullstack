import { IsInt, IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';
import { AdminPasswordDto } from './admin-password.dto';

export class UpdateProductDto extends AdminPasswordDto {
  @IsOptional()
  @IsString()
  @Length(4, 30)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(8, 8)
  barcode?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}
