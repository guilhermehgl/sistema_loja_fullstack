# Backend - Sistema Loja

API REST em NestJS para gestao de produtos e registro de pedidos/vendas.

## Modulos

- `products`: CRUD de produtos e operacoes administrativas.
- `orders`: criacao de pedido com baixa de estoque em transacao.

## Requisitos

- Node.js 20+
- PostgreSQL

## Instalar e executar

```bash
npm install
npm run start:dev
```

API em `http://localhost:3000`.

## Variaveis de ambiente

Crie `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=sistema_loja

ADMIN_PASSWORD_HASH=
# ADMIN_PASSWORD= # fallback apenas para desenvolvimento

TYPEORM_SYNC=false
TYPEORM_LOGGING=false
```

## Scripts

- `npm run start:dev`: desenvolvimento com watch.
- `npm run build`: build de producao.
- `npm run lint`: lint do projeto.
- `npm run test`: testes unitarios.
- `npm run test:e2e`: testes e2e.

## Endpoints principais

- `GET /products`
- `POST /products`
- `PATCH /products/:id`
- `DELETE /products/:id`
- `POST /orders`
