
CargoSNG Backend — Ready-to-deploy

### Быстрый старт локально
1. Копировать .env.example -> .env и заполнить DATABASE_URL
2. npm install
3. npm run migrate
4. npm start

### Deploy on Render
- Create a Web Service:
  - Root Directory: (where package.json is)
  - Build Command: npm install
  - Start Command: npm start
- Set Environment Variables: DATABASE_URL, JWT_SECRET, ALLOW_ORIGINS, BASE_CURRENCY, CURRENCY_API_URL
- Run migrations via a One-off Job: node migrations/run_migrations.js (Render Job)

Endpoints:
- GET /api/v1/health
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET /api/v1/cargos/list
- POST /api/v1/cargos/create
- POST /api/v1/tariffs/quote
- POST /api/v1/payment/kaspi/qr
