import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const rootDir = process.cwd();
const envFile = join(rootDir, '.env');
const outputDir = join(rootDir, 'src', 'environments');

function parseDotEnv(content) {
  const values = {};
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;
    const key = line.slice(0, eqIndex).trim();
    const value = line.slice(eqIndex + 1).trim().replace(/^"(.*)"$/, '$1');
    values[key] = value;
  }
  return values;
}

const fileEnv = existsSync(envFile)
  ? parseDotEnv(readFileSync(envFile, 'utf-8'))
  : {};

const apiUrlDev = process.env.FRONTEND_API_URL ?? fileEnv.FRONTEND_API_URL ?? 'http://localhost:3000';
const apiUrlProd =
  process.env.FRONTEND_API_URL_PROD ?? fileEnv.FRONTEND_API_URL_PROD ?? apiUrlDev;

mkdirSync(outputDir, { recursive: true });

const devContent = `export const environment = {
  apiUrl: '${apiUrlDev}',
};
`;

const prodContent = `export const environment = {
  apiUrl: '${apiUrlProd}',
};
`;

writeFileSync(join(outputDir, 'environment.ts'), devContent);
writeFileSync(join(outputDir, 'environment.production.ts'), prodContent);

console.log('Environment files generated from .env/process.env.');
