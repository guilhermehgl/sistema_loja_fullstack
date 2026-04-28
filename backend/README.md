# Backend - Sistema Loja

API NestJS responsável pelo catálogo de produtos e fluxo de vendas, com persistência em PostgreSQL via TypeORM.

## Stack

- NestJS
- TypeORM
- PostgreSQL
- Class Validator / Validation Pipe
- Jest + Supertest (e2e)

## Estrutura

```text
src/
  database/
    migrations/
    data-source.ts
    typeorm.config.ts
  products/
  orders/
  app.module.ts
  main.ts
```

## Variáveis de ambiente

Crie `.env` em `backend` com base em `.env.example`:

```bash
PORT=3000
CORS_ORIGIN=http://localhost:4200
DATABASE_URL=postgresql://user:password@localhost:5432/sistema_loja
DB_SSL=false
ADMIN_PASSWORD=1234
```

Para testes e2e:

```bash
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/sistema_loja_test
TEST_DB_SSL=false
```

## Executar localmente

```bash
npm install
npm run migration:run
npm run start:dev
```

API local: `http://localhost:3000`

Health check: `GET /`

## Migrations

O projeto usa migrations versionadas (`synchronize=false`).

```bash
npm run migration:run
npm run migration:revert
npm run migration:show
```

## Testes

Unitários:

```bash
npm test
```

E2E (fluxo de venda ponta a ponta com banco de teste):

```bash
npm run test:e2e
```

## Deploy (Render)

Configuração recomendada:

- Root Directory: `backend`
- Build Command: `npm ci && npm run build`
- Start Command: `npm run start:prod`
- Variáveis: `DATABASE_URL`, `DB_SSL`, `CORS_ORIGIN`, `ADMIN_PASSWORD`
