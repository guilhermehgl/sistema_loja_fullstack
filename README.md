# Sistema Loja Fullstack

Sistema fullstack de gestão de estoque e vendas com controle transacional, arquitetura em camadas e deploy em produção.

![Frontend - Vercel](https://img.shields.io/badge/Frontend-Vercel-000?style=for-the-badge&logo=vercel)
![Backend - Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=000)
![Database - Neon](https://img.shields.io/badge/Database-Neon-00E599?style=for-the-badge&logo=postgresql&logoColor=000)

## Acesse o Projeto

 https://sistema-loja-fullstack.vercel.app/

## Demonstração

![Preview do sistema](./docs/resumo.gif)

## Sobre o Projeto

Este projeto demonstra uma aplicação fullstack com foco em consistência de dados, organização em camadas e práticas utilizadas em ambientes reais de produção.

## Funcionalidades

- Cadastro de produtos
- Atualização e remoção de produtos
- Busca, ordenação e paginação
- Modal de venda com controle de estoque
- Mensagens amigáveis de loading, erro, vazio e sucesso

## Problema Resolvido

Aplicações simples de CRUD não tratam corretamente cenários como controle de estoque durante vendas simultâneas.
Este projeto implementa um fluxo de venda que garante consistência dos dados e evita inconsistências no estoque.
Esse tipo de abordagem é essencial em sistemas reais de e-commerce e gestão de estoque.

## Destaques Técnicos

- Controle de estoque com consistência de dados utilizando operações transacionais
- Banco PostgreSQL com migrations versionadas (pronto para produção)
- Estrutura preparada para ambiente de produção com controle de ambiente via variáveis (.env)
- Arquitetura backend modular com NestJS e separação por responsabilidades
- Tratamento centralizado de erros no frontend e backend
- Deploy completo em ambiente cloud (Vercel + Render + Neon)

## Qualidade e Confiabilidade (E2E)

O backend possui suíte de testes end-to-end cobrindo o fluxo crítico de negócio: venda com baixa de estoque.

- Cenário de sucesso ponta a ponta: cria produto, efetua venda e valida a persistência no banco com estoque atualizado
- Cenário de proteção de regra de negócio: bloqueia venda com estoque insuficiente e retorna erro de domínio
- Isolamento entre testes com limpeza de tabelas (`TRUNCATE ... RESTART IDENTITY CASCADE`) para eliminar flakiness
- Ambiente de teste dedicado via `TEST_DATABASE_URL` e `TEST_DB_SSL`, sem acoplamento ao ambiente de desenvolvimento
- Execução de migrations no setup e2e, garantindo alinhamento com esquema real de produção

Esse desenho reduz risco de regressão em operações transacionais e evidencia uma abordagem orientada a confiabilidade, não apenas cobertura superficial de endpoints.

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
- Banco: PostgreSQL hospedado no Neon

## API (Principais Endpoints)

| Método | Rota | Descrição |
|---|---|---|
| GET | /produtos | Lista produtos |
| POST | /produtos | Cria produto |
| PUT | /produtos/:id | Atualiza produto |
| DELETE | /produtos/:id | Remove produto |
| POST | /vendas | Registra venda |

## Documentação Técnica por Camada

Para detalhes técnicos completos, consulte:

- Frontend: [frontend/README.md](./frontend/README.md)
- Backend: [backend/README.md](./backend/README.md)

## CI/CD com GitHub Actions

Este repositório possui pipelines separados para garantir qualidade contínua e deploy automatizado:

- CI (`.github/workflows/ci.yml`)
- Executa em `pull_request` para `main` e em `push` para `main`/`develop`
- Backend: `lint`, testes unitários e `build`
- Frontend: `build`
- E2E backend opcional: roda apenas se `TEST_DATABASE_URL` estiver configurado em `GitHub Secrets`

- CD (`.github/workflows/cd.yml`)
- Executa após CI bem-sucedido na branch `main` (ou manualmente via `workflow_dispatch`)
- Dispara deploy por webhook para Render e Vercel

### Secrets necessários

No GitHub, adicione em `Settings > Secrets and variables > Actions`:

- `TEST_DATABASE_URL` (opcional, habilita job de e2e)
- `TEST_DB_SSL` (opcional, ex: `true`)
- `RENDER_DEPLOY_HOOK_URL` (opcional, habilita deploy backend)
- `VERCEL_DEPLOY_HOOK_URL` (opcional, habilita deploy frontend)

Se os hooks de deploy não estiverem configurados, o workflow de CD finaliza sem erro e apenas informa no sumário que os hooks estão ausentes.

## Melhorias Futuras

- Autenticação e autorização com JWT
- Pipeline CI/CD com GitHub Actions
- Dashboard com métricas de vendas e estoque

## Autor

Guilherme Henrique Guimarães Lima

- GitHub: [@guilhermehgl](https://github.com/guilhermehgl)
