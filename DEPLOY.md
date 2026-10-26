# Publicação — Vercel, Render e Neon

A demonstração está em https://sistema-loja-fullstack.vercel.app/ e usa a API https://sistema-loja-fullstack.onrender.com. Em 26/10/2026, Vercel (Ready) e Render (Live) foram conferidos no commit `603eb0e`, resultante do merge do PR #3, com CI da main aprovado. A revisão em desktop e mobile confirmou o catálogo e o produto fictício `20261020`, já editado e com saldo final de duas unidades; nenhuma nova venda foi executada nesta conferência.

## Compatibilidade e aprovação

A revisão publicada preserva o esquema PostgreSQL e não acrescenta migrations. O frontend envia adminPassword nas alterações e o backend exige esse campo. As duas versões compatíveis já estão publicadas. Em futuras atualizações, preservar essa compatibilidade e obter autorização antes de deploys ou alterações externas. Esta conferência de encerramento não alterou infraestrutura, migrations ou registros.

O workflow [ci.yml](.github/workflows/ci.yml) só valida código, com PostgreSQL descartável para E2E. Não existe cd.yml. Integrações externas podem criar previews por push/PR e produção por merge; conferir branches e efeitos antes de publicar. Não inserir deploy hooks em documentação.

## Configuração de referência

- Render: raiz backend, build npm ci && npm run build; start npm run start:prod. Manter DATABASE_URL, DB_SSL, CORS_ORIGIN e ADMIN_PASSWORD no ambiente seguro do serviço. Não há senha administrativa padrão.
- Vercel: raiz frontend, build npm run build, saída dist/frontend/browser. FRONTEND_API_URL_PROD precisa apontar para a API compatível e é incorporada no build. [Fallback SPA](frontend/vercel.json).
- Neon: preservar banco e migrations existentes. Alterações de schema/dados exigem aprovação separada; nunca configurar TEST_DATABASE_URL com conexão publicada.

[Blueprint de referência](render.yaml) · [Variáveis locais frontend](frontend/.env.example)

Antes de anunciar uma nova versão, conferir o CI do SHA, logs, catálogo, confirmações administrativas e fluxo completo em dados de teste autorizados. O preview frontend pode usar a API antiga: isso não certifica o novo backend. Rollback deve manter os dois contratos compatíveis, sem enfraquecer a confirmação administrativa.
