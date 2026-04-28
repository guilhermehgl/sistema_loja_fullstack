import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import 'dotenv/config';
import { buildTypeOrmOptions } from './database/typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(buildTypeOrmOptions()),
    ProductsModule,
    OrdersModule,
  ],
})
export class AppModule {}
