import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'estoque',
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }),
    ProductsModule,
    OrdersModule,
  ],
})
export class AppModule {}
