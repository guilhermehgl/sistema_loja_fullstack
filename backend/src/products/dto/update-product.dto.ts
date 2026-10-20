import {
  IsInt,
  IsNumber,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { AdminPasswordDto } from './admin-password.dto';
export class UpdateProductDto extends AdminPasswordDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MinLength(4)
  @MaxLength(30)
  @Matches(/\S/)
  name?: string;
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Matches(/^\d{8}$/, { message: 'Código deve conter exatamente 8 números.' })
  barcode?: string;
  @ValidateIf((_, value) => value !== undefined)
  @IsInt()
  @Min(0)
  quantity?: number;
  @ValidateIf((_, value) => value !== undefined)
  @IsNumber()
  @Min(0)
  price?: number;
}
