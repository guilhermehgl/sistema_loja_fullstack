# Backend - Sistema Loja

API REST em NestJS para gestao de produtos e registro de vendas.

## Visao Geral

Este backend centraliza:

- cadastro e consulta de produtos;
- atualizacao e exclusao com credencial administrativa;
- criacao de pedidos com baixa de estoque;
- healthcheck para monitoramento basico.

## Stack

- NestJS 11
- TypeORM
- PostgreSQL
- Class Validator / Class Transformer
- Jest + Supertest

## Estrutura

- `src/products/`: modulo de produtos (controller, service, entidade e DTOs).
- `src/orders/`: modulo de pedidos/vendas com transacao.
- `src/main.ts`: bootstrap da aplicacao (CORS e validacao global).
- `test/`: testes e2e.

## Endpoints Principais

### Health

- `GET /health`

### Products

- `GET /products`
- `POST /products`
- `PATCH /products/:id`
- `PATCH /products/:id/price`
- `DELETE /products/:id`
- `POST /products/admin/verify`

### Orders

- `POST /orders`

## Como Rodar

### Desenvolvimento local (sem Docker)

1. Copie o arquivo de ambiente:

```bash
# Linux/macOS
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

2. Instale dependencias e execute:

```bash
npm install
npm run db:up
npm run start:dev
```

API em `http://localhost:3000`.

Observacao: `npm run db:up` sobe somente o banco PostgreSQL via Docker em `localhost:5433`, sem precisar instalar Postgres no Windows.

### Via Docker Compose (stack completa)

Na raiz do projeto:

```bash
docker compose up --build
```

## Variaveis de Ambiente

Exemplo (`.env` local no backend):

```env
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASS=postgres
DB_NAME=sistema_loja

TYPEORM_SYNC=true
TYPEORM_LOGGING=true

ADMIN_PASSWORD_HASH=
# ADMIN_PASSWORD=admin123
```

Observacao: para desenvolvimento local, `TYPEORM_SYNC=true` acelera o setup. Em producao, prefira `TYPEORM_SYNC=false` com migracoes.

## Scripts

- `npm run start:dev`: desenvolvimento com hot reload.
- `npm run build`: build da aplicacao.
- `npm run lint`: lint do codigo.
- `npm run test`: testes unitarios.
- `npm run test:e2e`: testes e2e.
- `npm run dev`: sobe stack Docker completa (usando `../docker-compose.yml`).
- `npm run db:up`: sobe somente o banco via Docker.
- `npm run db:down`: para somente o banco.
- `npm run down`: derruba stack Docker.
- `npm run logs`: exibe logs da stack Docker.

## Qualidade

- `ValidationPipe` global com `whitelist`, `forbidNonWhitelisted` e `transform`.
- Tratamento de excecoes HTTP para validacoes de negocio.
- Fluxo de venda com transacao para manter consistencia de estoque e pedido.

## Melhorias Futuras

- Adicionar migracoes versionadas de banco.
- Aplicar rate limit nas rotas administrativas.
- Expandir cobertura de testes e2e para fluxo completo de produtos e pedidos.
