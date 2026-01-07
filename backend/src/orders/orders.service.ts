import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './orders.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../products/products.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async create(dto: CreateOrderDto) {
    return this.dataSource.transaction(async (manager) => {
      let total = 0;
      const items: OrderItem[] = [];

      for (const item of dto.items) {
        const product = await manager.findOneBy(Product, {
          id: item.productId,
        });

        if (!product) {
          throw new BadRequestException('Produto não encontrado');
        }

if (product.quantity < item.quantity) {
  throw new BadRequestException({
    message: `Estoque insuficiente para ${product.name}`,
  });
}


        product.quantity -= item.quantity;
        await manager.save(product);

        const orderItem = manager.create(OrderItem, {
          product,
          quantity: item.quantity,
          price: product.price,
        });

        total += product.price * item.quantity;
        items.push(orderItem);
      }

      const order = manager.create(Order, {
        total,
        items,
      });

      return manager.save(order);
    });
  }
}
