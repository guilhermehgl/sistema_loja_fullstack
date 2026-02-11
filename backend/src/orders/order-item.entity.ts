import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '../products/products.entity';
import { Order } from './orders.entity';

// Item individual de um pedido, mantendo referência ao produto e preço no momento da venda.
@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Order, (order) => order.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  // Snapshot de preço para preservar histórico mesmo após reajustes no produto.
  price: number;
}
