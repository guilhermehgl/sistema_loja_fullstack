import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import db from '../src/database/data-source';
import { createValidationPipe } from '../src/validation';

describe('Produtos e vendas com PostgreSQL descartável', () => {
  let app: INestApplication;
  const password = process.env.ADMIN_PASSWORD!;
  const http = () => app.getHttpServer() as Parameters<typeof request>[0];
  const product = async (barcode = '12345678', quantity = 5) => {
    const result = await request(http())
      .post('/products')
      .send({ name: 'Produto teste', barcode, quantity, price: 12.5 })
      .expect(201);
    return result.body as { id: string; quantity: number };
  };
  const sale = (items: { productId: string; quantity: number }[]) =>
    request(http()).post('/orders').send({ items });
  const quantity = async (id: string) => {
    const [row] = await db.query<{ quantity: number }[]>(
      'SELECT quantity FROM products WHERE id=$1',
      [id],
    );
    return row.quantity;
  };
  beforeAll(async () => {
    await db.initialize();
    await db.runMigrations();
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(createValidationPipe());
    // Um listener estável evita que Supertest feche o servidor entre requests paralelos.
    await app.listen(0, '127.0.0.1');
  });
  beforeEach(async () => {
    process.env.ADMIN_PASSWORD = password;
    await db.query(
      'TRUNCATE TABLE order_items, orders, products RESTART IDENTITY CASCADE',
    );
  });
  afterAll(async () => {
    if (app) await app.close();
    if (db.isInitialized) await db.destroy();
  });

  it('vende pelo preço do servidor e baixa o estoque', async () => {
    const p = await product();
    const result = await sale([{ productId: p.id, quantity: 2 }]).expect(201);
    expect(Number(result.body.total)).toBe(25);
    expect(await quantity(p.id)).toBe(3);
  });
  it('recusa estoque insuficiente e não cria venda', async () => {
    const p = await product('12345678', 1);
    await sale([{ productId: p.id, quantity: 2 }]).expect(400);
    expect(await quantity(p.id)).toBe(1);
    expect(await db.query('SELECT * FROM orders')).toHaveLength(0);
  });
  it('serializa duas vendas realmente sobrepostas: só uma consome a última unidade', async () => {
    const p = await product('12345678', 1);
    const blocker = db.createQueryRunner();
    await blocker.connect();
    await blocker.startTransaction();
    await blocker.query('SELECT id FROM products WHERE id=$1 FOR UPDATE', [
      p.id,
    ]);
    const attempts = [1, 2].map(() =>
      sale([{ productId: p.id, quantity: 1 }]).then((r) => r.status),
    );
    try {
      // As duas conexões precisam estar esperando o mesmo bloqueio antes de liberá-lo.
      let waiting = 0;
      for (let i = 0; i < 150 && waiting < 2; i++) {
        const [row] = await db.query(
          "SELECT count(*)::int AS count FROM pg_stat_activity WHERE datname=current_database() AND wait_event_type='Lock' AND state='active'",
        );
        waiting = row.count;
        if (waiting < 2)
          await new Promise((resolve) => setTimeout(resolve, 20));
      }
      expect(waiting).toBeGreaterThanOrEqual(2);
    } finally {
      await blocker.commitTransaction();
      await blocker.release();
    }
    expect((await Promise.all(attempts)).sort()).toEqual([201, 400]);
    expect(await quantity(p.id)).toBe(0);
    expect(await db.query('SELECT * FROM orders')).toHaveLength(1);
    expect(await db.query('SELECT * FROM order_items')).toHaveLength(1);
  });
  it('faz rollback de todos os itens quando o último não tem estoque', async () => {
    const products = [
      await product('12345678'),
      await product('87654321'),
    ].sort((a, b) => a.id.localeCompare(b.id));
    await db.query('UPDATE products SET quantity=0 WHERE id=$1', [
      products[1].id,
    ]);
    await sale(products.map((p) => ({ productId: p.id, quantity: 1 }))).expect(
      400,
    );
    expect(await quantity(products[0].id)).toBe(5);
    expect(await db.query('SELECT * FROM orders')).toHaveLength(0);
    expect(await db.query('SELECT * FROM order_items')).toHaveLength(0);
  });
  it('vendas com produtos em ordem inversa preservam ambos os saldos', async () => {
    const products = [
      await product('12345678', 2),
      await product('87654321', 2),
    ];
    const items = products.map((p) => ({ productId: p.id, quantity: 1 }));
    const responses = await Promise.all([
      sale(items),
      sale([...items].reverse()),
    ]);
    expect(responses.map((r) => r.status)).toEqual([201, 201]);
    for (const p of products) expect(await quantity(p.id)).toBe(0);
  });
  it('consolida produtos repetidos antes da validação', async () => {
    const p = await product('12345678', 3);
    await sale([
      { productId: p.id, quantity: 2 },
      { productId: p.id.toUpperCase(), quantity: 2 },
    ]).expect(400);
    expect(await quantity(p.id)).toBe(3);
    await sale([
      { productId: p.id, quantity: 1 },
      { productId: p.id, quantity: 2 },
    ]).expect(201);
    expect(await quantity(p.id)).toBe(0);
    expect(await db.query('SELECT * FROM order_items')).toHaveLength(1);
  });
  it.each([false, true])(
    'reposição concorrente sem perda, produto já existe: %s',
    async (existing) => {
      if (existing) await product('12345678', 2);
      const responses = await Promise.all(
        Array.from({ length: 8 }, () =>
          request(http()).post('/products').send({
            name: 'Reposição teste',
            barcode: '12345678',
            quantity: 1,
            price: 9,
          }),
        ),
      );
      expect(responses.every((r) => r.status === 201)).toBe(true);
      const all = await request(http()).get('/products').expect(200);
      expect(all.body).toHaveLength(1);
      expect(all.body[0].quantity).toBe(existing ? 10 : 8);
    },
  );

  it('atualização parcial e preço exigem confirmação no próprio endpoint', async () => {
    const p = await product();
    await request(http())
      .patch('/products/' + p.id)
      .send({ price: 20 })
      .expect(400);
    await request(http())
      .patch('/products/' + p.id + '/price')
      .send({ price: 20 })
      .expect(400);
    await request(http())
      .patch('/products/' + p.id)
      .send({ price: 20, adminPassword: 'errada' })
      .expect(403);
    await request(http())
      .patch('/products/' + p.id)
      .send({ price: 20, adminPassword: password })
      .expect(200);
    expect(await quantity(p.id)).toBe(5);
    await request(http())
      .patch('/products/' + p.id + '/price')
      .send({ price: 21, adminPassword: password })
      .expect(200);
    await request(http())
      .delete('/products/' + p.id)
      .send({ adminPassword: password })
      .expect(200);
  });
  it.each([undefined, '', null, 12, {}, 'errada'])(
    'exclusão recusa senha inválida: %j',
    async (adminPassword) => {
      const p = await product();
      const r = await request(http())
        .delete('/products/' + p.id)
        .send({ adminPassword });
      expect([400, 403]).toContain(r.status);
      expect(await quantity(p.id)).toBe(5);
    },
  );
  it.each([undefined, '', '   '])(
    'configuração administrativa ausente/vazia falha fechada: %j',
    async (configured) => {
      const p = await product();
      if (configured === undefined) delete process.env.ADMIN_PASSWORD;
      else process.env.ADMIN_PASSWORD = configured;
      await request(http())
        .post('/products/validate-password')
        .send({})
        .expect(503);
      await request(http())
        .patch('/products/' + p.id)
        .send({ price: 1, adminPassword: password })
        .expect(503);
      await request(http())
        .delete('/products/' + p.id)
        .send({ adminPassword: password })
        .expect(503);
      expect(await quantity(p.id)).toBe(5);
    },
  );
  it('valida senha sem aceitar ausentes ou tipos inválidos', async () => {
    for (const value of [undefined, '', 7, {}, 'errada']) {
      const r = await request(http())
        .post('/products/validate-password')
        .send({ password: value })
        .expect(201);
      expect(r.body.valid).toBe(false);
    }
    const r = await request(http())
      .post('/products/validate-password')
      .send({ password })
      .expect(201);
    expect(r.body.valid).toBe(true);
  });
  it.each([
    { price: -1 },
    { price: '2' },
    { price: null },
    { quantity: -1 },
    { quantity: 1.5 },
    { quantity: '2' },
    { barcode: 'abcdefgh' },
    { barcode: '123' },
    { name: 42 },
    { name: null },
    { extra: true },
  ])('rejeita edição malformada: %j', async (invalid) => {
    const p = await product();
    await request(http())
      .patch('/products/' + p.id)
      .send({ ...invalid, adminPassword: password })
      .expect(400);
    expect(await quantity(p.id)).toBe(5);
  });
  it('cadastro valida o código numérico e tipos; conflito na edição é 409', async () => {
    await request(http())
      .post('/products')
      .send({ name: 'Teste', barcode: 'abcdefgh', quantity: 1, price: 1 })
      .expect(400);
    await request(http())
      .post('/products')
      .send({ name: 'Teste', barcode: '12345678', quantity: '1', price: 1 })
      .expect(400);
    const p = await product();
    await product('87654321');
    await request(http())
      .patch('/products/' + p.id)
      .send({ barcode: '87654321', adminPassword: password })
      .expect(409);
  });
  it('valida DTOs aninhados de venda com o mesmo pipe da aplicação', async () => {
    const p = await product();
    const r = await sale([{ productId: p.id, quantity: -1 }]).expect(400);
    expect(r.body.errors.length).toBeGreaterThan(0);
    await sale([]).expect(400);
    expect(await quantity(p.id)).toBe(5);
  });
});
