import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

// Guarantee test DB env is ready before AppModule/TypeORM loads in e2e specs.
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}

if (process.env.TEST_DB_SSL) {
  process.env.DB_SSL = process.env.TEST_DB_SSL;
}

process.env.NODE_ENV = 'test';
