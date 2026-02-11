# Frontend - Sistema Loja

Aplicacao Angular para operacao de estoque e vendas integrada ao backend NestJS.

## Visao Geral

O frontend oferece:

- cadastro de produtos com validacao de formulario;
- listagem com busca, ordenacao e paginacao;
- edicao e exclusao com validacao de credencial administrativa;
- modal de venda com carrinho e envio de pedido para API.

## Stack

- Angular 21 (standalone components)
- RxJS
- Angular Forms (reactive + template-driven)
- Vitest

## Estrutura

- `src/app/pages/products/`: pagina principal e componentes de produto.
- `src/app/core/services/`: servicos HTTP e estado local.
- `src/app/shared/components/modal/`: modais reutilizaveis.
- `src/environments/`: configuracao de ambiente (`apiUrl`).

## Integracao com API

Por padrao, o frontend consome:

- `http://localhost:3000/products`
- `http://localhost:3000/orders`

A URL base da API e centralizada em:

- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

## Como Rodar

### Desenvolvimento local

```bash
npm install
npm start
```

App em `http://localhost:4200`.

### Via Docker Compose (stack completa)

Na raiz do projeto:

```bash
docker compose up --build
```

## Scripts

- `npm start`: servidor de desenvolvimento.
- `npm run build`: build de producao.
- `npm run watch`: build em modo watch.
- `npm test -- --watch=false`: testes em modo nao interativo.

## Qualidade e UX

- Validacoes de formulario com mensagens de erro por campo.
- Feedback visual com modais de alerta/confirmacao.
- Fluxo de venda com controle de quantidade e validacao de estoque no backend.

## Melhorias Futuras

- Testes de componentes e fluxos de tela.
- Internacionalizacao (i18n).
- Melhorias de acessibilidade (ARIA, navegacao por teclado e foco).
