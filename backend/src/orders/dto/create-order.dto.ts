import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateOrderItemDto {
  @IsUUID('4', { message: 'O produto informado é inválido.' })
  productId: string;

  @IsInt()
  @Min(1, { message: 'A quantidade mínima por item é 1.' })
  quantity: number;
}

export class CreateOrderDto {
  @IsArray({ message: 'A lista de itens é obrigatória.' })
  @ArrayMinSize(1, {
    message: 'Inclua ao menos um item para finalizar a venda.',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
