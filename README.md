# Sistema Loja Fullstack

Sistema full stack para cadastro de produtos e controle de vendas, com frontend em Angular e backend em NestJS integrado ao PostgreSQL (Neon).

![Frontend - Vercel](https://img.shields.io/badge/Frontend-Vercel-000?style=for-the-badge&logo=vercel)
![Backend - Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=000)
![Database - Neon](https://img.shields.io/badge/Database-Neon-00E599?style=for-the-badge&logo=postgresql&logoColor=000)

## Preview

![Preview do sistema](./docs/resumo.gif)

## Sobre o Projeto

Este projeto demonstra uma aplicação web completa com foco em:

- separação clara entre frontend e backend
- validação de dados no cliente e no servidor
- arquitetura com migrations versionadas no banco
- deploy em produção com Vercel + Render + Neon

## Funcionalidades

- Cadastro de produtos
- Atualização e remoção de produtos
- Busca, ordenação e paginação
- Modal de venda com controle de estoque
- Mensagens amigáveis de loading, erro, vazio e sucesso

## Diferenciais Técnicos

- Backend NestJS com TypeORM e migrations versionadas
- Validação global no backend com payload de erro padronizado
- Frontend com tratamento centralizado de erros da API
- Configuração de ambiente por `.env` para frontend e backend

## Arquitetura (Visão Geral)

```mermaid
flowchart LR
  U["Usuário"] --> F["Frontend (Angular/Vercel)"]
  F --> B["Backend API (NestJS/Render)"]
  B --> D["PostgreSQL (Neon)"]
```

## Executar Localmente

### Requisitos

- Node.js 22+
- npm 10+
- PostgreSQL local ou Neon

### Passo a passo

1. Clonar repositório

```bash
git clone https://github.com/guilhermehgl/sistema_loja_fullstack.git
cd sistema_loja_fullstack
```

2. Configurar variáveis de ambiente

```bash
# backend/.env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/sistema_loja
DB_SSL=false
ADMIN_PASSWORD=1234
CORS_ORIGIN=http://localhost:4200

# frontend/.env
FRONTEND_API_URL=http://localhost:3000
FRONTEND_API_URL_PROD=https://seu-backend.onrender.com
```

3. Subir backend

```bash
cd backend
npm install
npm run migration:run
npm run start:dev
```

4. Subir frontend (novo terminal)

```bash
cd frontend
npm install
npm run start
```

### Acessos locais

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3000`

## Deploy

- Frontend: [https://sistema-loja-fullstack.vercel.app/](https://sistema-loja-fullstack.vercel.app/)
- Backend: [https://sistema-loja-fullstack.onrender.com](https://sistema-loja-fullstack.onrender.com)
- Banco: Neon

## Documentação Técnica por Camada

Para detalhes técnicos completos, consulte:

- Frontend: [frontend/README.md](./frontend/README.md)
- Backend: [backend/README.md](./backend/README.md)

## Melhorias Futuras

- Autenticação/autorização (JWT)
- Dashboard de vendas e métricas
- Testes unitários de frontend
- CI/CD com validação automática

## Autor

Guilherme Henrique Guimarães Lima

- GitHub: [@guilhermehgl](https://github.com/guilhermehgl)
