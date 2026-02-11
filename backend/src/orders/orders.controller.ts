import { Body, Controller, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

// Camada HTTP responsável por receber requisições de criação de pedidos.
@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post()
  // Delega toda a regra de negócio para o service transacional.
  create(@Body() dto: CreateOrderDto) {
    return this.service.create(dto);
  }
}
