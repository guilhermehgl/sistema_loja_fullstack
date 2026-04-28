import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL;
const shouldUseSsl = (process.env.DB_SSL ?? 'true').toLowerCase() !== 'false';

const typeOrmConfig: TypeOrmModuleOptions = databaseUrl
  ? {
      type: 'postgres',
      url: databaseUrl,
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }
  : {
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    };

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ProductsModule,
    OrdersModule,
  ],
})
export class AppModule {}
