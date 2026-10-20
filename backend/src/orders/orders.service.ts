import { BadRequestException, Injectable } from '@nestjs/common';
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

      const quantities = new Map<string, number>();
      for (const item of dto.items) {
        const id = item.productId.toLowerCase();
        quantities.set(id, (quantities.get(id) ?? 0) + item.quantity);
      }
      // Todas as vendas adquirem os bloqueios na mesma ordem.
      for (const [productId, quantity] of [...quantities].sort(([a], [b]) =>
        a.localeCompare(b),
      )) {
        const product = await manager.findOne(Product, {
          where: { id: productId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) {
          throw new BadRequestException('Produto não encontrado');
        }

        if (product.quantity < quantity) {
          throw new BadRequestException(
            `Estoque insuficiente para ${product.name}.`,
          );
        }

        product.quantity -= quantity;
        await manager.save(product);

        const orderItem = manager.create(OrderItem, {
          product,
          quantity,
          price: product.price,
        });

        total += product.price * quantity;
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
