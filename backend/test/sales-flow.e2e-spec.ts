import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import testDataSource from '../src/database/data-source';

describe('Sales flow (e2e)', () => {
  let app: INestApplication;
  let db: DataSource;
  const testDatabaseUrl = process.env.TEST_DATABASE_URL;

  beforeAll(async () => {
    if (!testDatabaseUrl) {
      throw new Error('TEST_DATABASE_URL não definido. Configure um banco de teste PostgreSQL.');
    }

    process.env.DATABASE_URL = testDatabaseUrl;
    process.env.DB_SSL = process.env.TEST_DB_SSL ?? 'false';
    process.env.NODE_ENV = 'test';

    db = testDataSource;
    if (!db.isInitialized) {
      await db.initialize();
    }

    await db.runMigrations();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await db.query('TRUNCATE TABLE "order_items", "orders", "products" RESTART IDENTITY CASCADE');
    await app.close();
    await db.destroy();
  });

  it('deve completar o fluxo de venda ponta a ponta', async () => {
    const createdProduct = await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Produto E2E',
        barcode: '87654321',
        quantity: 10,
        price: 25.9,
      })
      .expect(201);

    const productId = createdProduct.body.id as string;

    await request(app.getHttpServer())
      .post('/orders')
      .send({
        items: [
          {
            productId,
            quantity: 3,
          },
        ],
      })
      .expect(201);

    const productsAfterSale = await request(app.getHttpServer())
      .get('/products')
      .expect(200);

    const soldProduct = productsAfterSale.body.find((p: { id: string }) => p.id === productId);
    expect(soldProduct).toBeDefined();
    expect(soldProduct.quantity).toBe(7);

    const ordersCount = await db.query('SELECT COUNT(*)::int AS total FROM "orders"');
    expect(ordersCount[0].total).toBe(1);
  });

  it('deve impedir venda com estoque insuficiente', async () => {
    const createdProduct = await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Produto Sem Estoque',
        barcode: '12344321',
        quantity: 1,
        price: 9.99,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/orders')
      .send({
        items: [
          {
            productId: createdProduct.body.id,
            quantity: 5,
          },
        ],
      })
      .expect(400)
      .expect(({ body }) => {
        expect(String(body.message)).toContain('Estoque insuficiente');
      });
  });
});
