# Frontend - Sistema Loja

Interface Angular para operacao de estoque e vendas.

## Funcionalidades

- Cadastro de produtos com validacao de formulario.
- Listagem com busca, ordenacao e paginacao.
- Edicao e exclusao com confirmacao administrativa.
- Modal de venda com carrinho e envio de pedido para API.

## Requisitos

- Node.js 20+
- Backend rodando em `http://localhost:3000`

## Rodar localmente

```bash
npm install
npm start
```

App em `http://localhost:4200`.

## Scripts

- `npm start`: servidor de desenvolvimento.
- `npm run build`: build de producao.
- `npm test`: testes com Vitest.

## Estrutura resumida

- `src/app/core/services`: acesso HTTP para produtos e pedidos.
- `src/app/pages/products`: pagina principal e componentes de produto.
- `src/app/shared/components/modal`: modais reutilizaveis.
