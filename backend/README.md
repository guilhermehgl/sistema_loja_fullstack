# Backend — Sistema Loja

API NestJS/TypeORM/PostgreSQL organizada em produtos, vendas e migrations. Contratos e decisões estão no [README principal](../README.md).

## Execução

Copie .env.example para .env e configure um PostgreSQL local, DB_SSL=false, CORS_ORIGIN e ADMIN_PASSWORD própria. Configuração administrativa ausente ou vazia bloqueia alterações protegidas; não há senha padrão.

```bash
npm ci
npm run migration:run
npm run start:dev
```

API local em http://localhost:3000. Consulte GET /products para verificar acesso ao catálogo; não há endpoint de health dedicado implementado.

## Qualidade

```bash
npm run lint
npm test -- --runInBand
npm run build
```

E2E: npm run test:e2e, somente após preparar PostgreSQL local descartável. Exige TEST_DATABASE_URL apontando para banco com sufixo _test e TEST_DATABASE_ISOLATED=true. O setup não carrega .env, força SSL desativado para loopback e gera senha administrativa efêmera. As tabelas são truncadas entre testes. O CI cria o PostgreSQL temporário automaticamente e não aceita pular E2E por ausência de secret.

Migrations são explícitas: migration:run, migration:show e migration:revert. synchronize e migrationsRun permanecem desativados. Não executar estes comandos no banco publicado nesta etapa.

## Contrato administrativo

PATCH /products/:id e PATCH /products/:id/price recebem adminPassword junto aos campos alterados. DELETE /products/:id recebe somente a confirmação. POST /products/validate-password recebe password e retorna valid, sem conceder sessão; a operação final confere novamente a senha. Ausência de configuração retorna 503 genérico; senha incorreta, 403; DTO inválido, 400; conflito de código de barras, 409.
