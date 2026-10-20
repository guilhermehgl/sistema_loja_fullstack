# Frontend - Sistema Loja

Aplicação Angular responsável pela interface de cadastro, listagem e venda de produtos.

## Stack

- Angular 21
- SCSS
- RxJS
- Build com Angular CLI

## Estrutura

```text
src/
  app/
    core/
      services/
      utils/
    pages/
      products/
    shared/
      components/modal/
```

## Variáveis de ambiente

Crie um arquivo `.env` em `frontend` baseado em `.env.example`:

```bash
FRONTEND_API_URL=http://localhost:3000
FRONTEND_API_URL_PROD=https://seu-backend.onrender.com
```

O script `scripts/generate-env.mjs` gera:
- `src/environments/environment.ts`
- `src/environments/environment.production.ts`

## Executar localmente

```bash
npm install
npm run start
```

Aplicação: `http://localhost:4200`

## Build

```bash
npm run build
```

Saída padrão Angular: `dist/frontend/browser`

## Boas práticas aplicadas

- Validação de formulário com mensagens amigáveis
- Estado de UI completo (loading, erro, vazio, sucesso)
- Formatação monetária em `pt-BR`
- Tratamento centralizado de erro HTTP

## Deploy (Vercel)

Configuração recomendada:

- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist/frontend/browser`
- Variável obrigatória: `FRONTEND_API_URL_PROD`

Edição e exclusão exigem confirmação administrativa no backend. A senha fica somente em memória durante a edição; o PATCH envia apenas campos alterados. Não publicar este frontend como prova de compatibilidade do backend antigo. Testes: npm test -- --watch=false.
