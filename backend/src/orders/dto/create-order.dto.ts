import { Type } from 'class-transformer';
import { IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';

// DTO de cada item enviado na criação de pedido.
export class CreateOrderItemDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

// DTO raiz que representa o payload de criação de pedido.
export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
