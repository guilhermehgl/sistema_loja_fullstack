import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './orders.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../products/products.entity';

// Módulo de pedidos: expõe controller e service com acesso às entidades necessárias.
@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
