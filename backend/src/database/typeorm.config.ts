import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { OrderItem } from '../orders/order-item.entity';
import { Order } from '../orders/orders.entity';
import { Product } from '../products/products.entity';

export function buildTypeOrmOptions(): TypeOrmModuleOptions {
  const databaseUrl = process.env.DATABASE_URL;
  const shouldUseSsl = (process.env.DB_SSL ?? 'true').toLowerCase() !== 'false';
  const isProduction = process.env.NODE_ENV === 'production';

  return databaseUrl
    ? {
        type: 'postgres',
        url: databaseUrl,
        ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
        entities: [Product, Order, OrderItem],
        synchronize: false,
        logging: !isProduction,
        migrationsRun: false,
        migrations: ['dist/src/database/migrations/*.js'],
      }
    : {
        type: 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
        entities: [Product, Order, OrderItem],
        synchronize: false,
        logging: !isProduction,
        migrationsRun: false,
        migrations: ['dist/src/database/migrations/*.js'],
      };
}

export function buildDataSourceOptions(): DataSourceOptions {
  return buildTypeOrmOptions() as DataSourceOptions;
}
