import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module'
import { HealthController } from './health.controller';
import 'dotenv/config';

const asBool = (value?: string) => value?.toLowerCase() === 'true';

@Module({
  controllers: [HealthController],
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: asBool(process.env.TYPEORM_SYNC),
      logging: asBool(process.env.TYPEORM_LOGGING),
    }),
    ProductsModule,
    OrdersModule,
  ],
})
export class AppModule { }
