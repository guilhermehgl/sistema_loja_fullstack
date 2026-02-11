# Sistema Loja

Aplicacao fullstack para gestao de produtos e registro de vendas.

## Stack

- Frontend: Angular 21 (standalone components)
- Backend: NestJS 11 + TypeORM
- Banco: PostgreSQL

## Estrutura

- `frontend/`: interface web, formularios, lista de produtos e fluxo de venda.
- `backend/`: API REST com modulos `products` e `orders`.
- `docker/`: reservado para infraestrutura local.

## Funcionalidades atuais

- Cadastro e atualizacao de produtos por codigo de barras.
- Listagem com busca, ordenacao e paginacao.
- Exclusao e edicao de produto com autenticacao administrativa.
- Registro de venda com controle de estoque e transacao no backend.

## Como rodar localmente

1. Backend
```bash
cd backend
npm install
npm run start:dev
```

2. Frontend
```bash
cd frontend
npm install
npm start
```

App frontend: `http://localhost:4200`  
API backend: `http://localhost:3000`

## Variaveis de ambiente (backend)

Crie `backend/.env` com:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=sistema_loja

# Recomendado para demos publicas (sha256 em hex)
ADMIN_PASSWORD_HASH=

# Apenas para desenvolvimento local
# ADMIN_PASSWORD=

TYPEORM_SYNC=false
TYPEORM_LOGGING=false
```

## Gerar hash da senha admin

```bash
node -e "console.log(require('node:crypto').createHash('sha256').update('sua_senha').digest('hex'))"
```

Use o valor em `ADMIN_PASSWORD_HASH`.

## Proximos passos recomendados

- Adicionar `docker-compose` para API + banco.
- Configurar pipeline CI para lint e testes.
- Publicar demo (frontend + backend) e incluir screenshots/GIF no README.
