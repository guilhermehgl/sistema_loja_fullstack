# Sistema Loja

Webapp fullstack para gestao de estoque e registro de vendas, desenvolvido como projeto de portfolio.

## Visao Geral

O sistema permite cadastrar produtos por codigo de barras, controlar estoque, editar/excluir itens com autenticacao administrativa e registrar vendas com baixa de estoque em transacao no backend.

## Demo

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3000`
- Healthcheck: `GET http://localhost:3000/health`

## Stack Tecnica

- Frontend: Angular 21 (standalone components)
- Backend: NestJS 11 + TypeORM
- Banco de dados: PostgreSQL 16
- Infra local: Docker Compose
- Testes: Jest (backend) e Vitest (frontend)

## Arquitetura

### Frontend (`frontend/`)

- Pagina principal de produtos.
- Cadastro de itens.
- Listagem com busca, ordenacao e paginacao.
- Edicao e exclusao com senha administrativa.
- Fluxo de venda em modal com carrinho.

### Backend (`backend/`)

- Modulo `products`: cadastro, listagem, edicao, exclusao e verificacao de credencial admin.
- Modulo `orders`: criacao de pedido com transacao e baixa de estoque.
- `ValidationPipe` global com `whitelist`, `forbidNonWhitelisted` e `transform`.

### Banco

- Tabelas principais:
- `products`
- `orders`
- `order_items`

## Regras de Negocio Implementadas

- Produto com mesmo `barcode` incrementa quantidade em vez de duplicar cadastro.
- Venda so e concluida se houver estoque suficiente para todos os itens.
- Exclusao e edicao exigem credencial administrativa.
- Registro de venda e baixa de estoque rodam em transacao no backend.

## Como Executar

### Opcao 1: Docker (recomendado)

1. Copie o arquivo de ambiente na raiz:

```bash
# Linux/macOS
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

2. Suba toda a stack:

```bash
docker compose up --build
```

### Opcao 2: Execucao local sem Docker

1. Backend:

```bash
cd backend
npm install
npm run start:dev
```

2. Frontend:

```bash
cd frontend
npm install
npm start
```

## Variaveis de Ambiente

Observacao: `TYPEORM_SYNC=true` e recomendado apenas para desenvolvimento local. Em ambiente de producao, prefira `TYPEORM_SYNC=false` com migracoes.

### Raiz (`.env`) - usado pelo Docker Compose

```env
DB_NAME=sistema_loja
DB_USER=postgres
DB_PASS=postgres

PORT=3000
FRONTEND_PORT=4200
TYPEORM_SYNC=true
TYPEORM_LOGGING=true

ADMIN_PASSWORD_HASH=
# ADMIN_PASSWORD=admin123
```

### Backend local (`backend/.env`) - sem Docker

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=sistema_loja

TYPEORM_SYNC=true
TYPEORM_LOGGING=true

ADMIN_PASSWORD_HASH=
# ADMIN_PASSWORD=admin123
```

### Gerar hash da senha admin

```bash
node -e "console.log(require('node:crypto').createHash('sha256').update('sua_senha').digest('hex'))"
```

## Scripts Principais

### Backend (`backend/package.json`)

- `npm run dev`: sobe stack completa via Docker Compose.
- `npm run down`: derruba stack Docker.
- `npm run logs`: acompanha logs da stack.
- `npm run test`: testes unitarios backend.
- `npm run test:e2e`: testes e2e backend.

### Frontend (`frontend/package.json`)

- `npm start`: servidor de desenvolvimento Angular.
- `npm run build`: build de producao.
- `npm test -- --watch=false`: testes frontend em modo nao interativo.

## Endpoints Principais

### Products

- `GET /products`
- `POST /products`
- `PATCH /products/:id`
- `PATCH /products/:id/price`
- `DELETE /products/:id`
- `POST /products/admin/verify`

### Orders

- `POST /orders`

### Health

- `GET /health`

## Qualidade e Testes

- Backend com testes unitarios para service/controller de produtos.
- Backend com teste e2e de healthcheck.
- Frontend com testes de servicos HTTP de produtos e pedidos.

## Melhorias Futuras

- Migracoes de banco (em vez de sincronizacao automatica).
- Rate limit para rotas administrativas.
- CI com lint + testes no GitHub Actions.
- Observabilidade (logs estruturados e monitoramento basico).
- Screenshots/GIF de demonstracao no README.
