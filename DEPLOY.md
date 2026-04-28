# Deploy (Vercel + Render + Neon)

## 1) Banco (Neon)
1. Crie um projeto Postgres no Neon.
2. Copie a connection string (`DATABASE_URL`).

## 2) Backend (Render)
1. No Render, crie um `Web Service` apontando para este repositório.
2. Configure `Root Directory` como `backend`.
3. `Build Command`: `npm ci && npm run build`
4. `Start Command`: `npm run start:prod`
5. Variáveis de ambiente:
   - `DATABASE_URL` = string do Neon
   - `DB_SSL` = `true`
   - `ADMIN_PASSWORD` = senha administrativa
   - `CORS_ORIGIN` = URL do frontend na Vercel (ex: `https://meu-app.vercel.app`)
6. Deploy.

Opcional: usar o [render.yaml](/C:/Users/guilherme.guimaraes/Desktop/sistema_loja_fullstack/render.yaml) para blueprint.

## 3) Frontend (Vercel)
1. No Vercel, importe o repositório com `Root Directory` = `frontend`.
2. Framework preset: `Other` (build Angular manual) ou `Angular` se detectado automaticamente.
3. Build command: `npm run build`
4. Output directory: `dist/frontend/browser`
5. Configure variável de ambiente no Vercel:
   - `FRONTEND_API_URL_PROD` = URL do backend Render (ex: `https://meu-backend.onrender.com`)
6. Deploy.

O arquivo [vercel.json](/C:/Users/guilherme.guimaraes/Desktop/sistema_loja_fullstack/frontend/vercel.json) já está configurado para fallback de rotas SPA.

Para desenvolvimento local, copie [frontend/.env.example](/C:/Users/guilherme.guimaraes/Desktop/sistema_loja_fullstack/frontend/.env.example) para `.env` dentro de `frontend`.

## 4) Checklist final
- Backend responde em `https://SEU-BACKEND.onrender.com/products`.
- Frontend abre sem erro de CORS.
- Operações de produto/venda persistem no Neon.
