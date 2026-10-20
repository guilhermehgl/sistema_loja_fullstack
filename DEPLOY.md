# Publicação — Vercel, Render e Neon

A demonstração existente está em https://sistema-loja-fullstack.vercel.app/ e usa a API https://sistema-loja-fullstack.onrender.com. A presença desses serviços não certifica que o código deste PR já esteja publicado.

## Compatibilidade e aprovação

Esta revisão preserva o esquema PostgreSQL e não acrescenta migrations. O frontend novo envia adminPassword nas alterações; o backend novo passa a exigir esse campo. Publicar o backend sozinho interrompe a edição pelo frontend antigo. A publicação precisa coordenar as duas versões e requer autorização própria. Não há deploy manual, mudança de configuração externa ou operação de banco nesta tarefa.

O workflow [ci.yml](.github/workflows/ci.yml) só valida código, com PostgreSQL descartável para E2E. Não existe cd.yml. Integrações externas podem criar previews por push/PR e produção por merge; conferir branches e efeitos antes de publicar. Não inserir deploy hooks em documentação.

## Configuração de referência para futura publicação autorizada

- Render: raiz backend, build npm ci && npm run build; start npm run start:prod. Manter DATABASE_URL, DB_SSL, CORS_ORIGIN e ADMIN_PASSWORD no ambiente seguro do serviço. Não há senha administrativa padrão.
- Vercel: raiz frontend, build npm run build, saída dist/frontend/browser. FRONTEND_API_URL_PROD precisa apontar para a API compatível e é incorporada no build. [Fallback SPA](frontend/vercel.json).
- Neon: preservar banco e migrations existentes. Alterações de schema/dados exigem aprovação separada; nunca configurar TEST_DATABASE_URL com conexão publicada.

[Blueprint de referência](render.yaml) · [Variáveis locais frontend](frontend/.env.example)

Antes de anunciar uma nova versão, conferir o CI do SHA, logs, catálogo, confirmações administrativas e fluxo completo em dados de teste autorizados. O preview frontend pode usar a API antiga: isso não certifica o novo backend. Rollback deve manter os dois contratos compatíveis, sem enfraquecer a confirmação administrativa.
