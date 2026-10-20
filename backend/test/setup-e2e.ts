import { randomBytes } from 'node:crypto';
// Executado antes de carregar AppModule/DataSource. Nunca lê .env da aplicação.
const raw = process.env.TEST_DATABASE_URL;
if (!raw || process.env.TEST_DATABASE_ISOLATED !== 'true') {
  throw new Error(
    'E2E exige PostgreSQL descartável, TEST_DATABASE_URL e TEST_DATABASE_ISOLATED=true.',
  );
}
const url = new URL(raw);
if (
  !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ||
  !url.pathname.endsWith('_test')
) {
  throw new Error(
    'E2E aceita somente banco local com nome terminado em _test.',
  );
}
process.env.DATABASE_URL = raw;
process.env.DB_SSL = 'false';
process.env.NODE_ENV = 'test';
// Credencial efêmera somente do teste; não é senha padrão da aplicação.
process.env.ADMIN_PASSWORD = randomBytes(32).toString('hex');
