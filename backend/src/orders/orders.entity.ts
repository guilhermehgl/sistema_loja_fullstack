import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

// Entidade principal do pedido com total consolidado e itens relacionados.
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => OrderItem, (item) => item.order, {
    // Persiste automaticamente os itens ao salvar o pedido.
    cascade: true,
  })
  items: OrderItem[];
}
