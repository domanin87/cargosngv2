
# 📘 README — Развёртывание CargoSNG на Render (полная инструкция)

В этом документе — подробные пошаговые инструкции по развёртыванию проекта CargoSNG в Render (Postgres + Backend + Frontend),
а также по публикации мобильного клиента (Flutter Web / Android / iOS).
Документ полностью на русском.

---

## Структура репозитория (корень архива)
- `backend/` — Node.js + Express + Sequelize (Postgres). Содержит: роуты, модели, миграции, `.env.example`, Dockerfile.
- `frontend/` — React + Vite. `frontend/dist/` содержит готовую сборку для продакшена.
- `mobile/` — Flutter (web/android/iOS). Содержит пример `key.properties` и `build.gradle.example`.
- `migrations/init.sql` — SQL для создания таблиц (users, cargos, orders, tariffs).
- `postman/` — коллекция Postman для тестирования API.
- `render/` — пример `render.yaml` для быстрого старта (опционально).
- `docker-compose.yml` — для локальной разработки (Postgres + backend).
- `.github/workflows/flutter_build.yml` — пример CI для сборки Flutter Web и Android (AAB).

---

# ЧАСТЬ A — Подготовка и пуш в GitHub

1. Создайте репозиторий на GitHub (например `CargoSNG`) и скопируйте URL.
2. В локальной папке проекта выполните:
```bash
git init
git add .
git commit -m "CargoSNG initial"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/CargoSNG.git
git push -u origin main
```
> Примечание: не коммитьте `mobile/android/key.properties` и `mobile/release-key.jks` в репозиторий. Используйте Secrets в GitHub Actions для хранения keystore и паролей.

---

# ЧАСТЬ B — Создание Managed PostgreSQL в Render

1. Перейдите в Render Dashboard → **New** → **Database** → **PostgreSQL**.
2. Укажите имя (например `cargosng-db`) и версию (рекомендуется 13/14/15).
3. Создайте базу. После создания откройте её и скопируйте **Connection string** — это ваша переменная:
```
DATABASE_URL=postgres://<user>:<password>@<host>:5432/<dbname>?sslmode=require
```
Скопируйте и сохраните — она понадобится для backend.

> Важно: Render выдаёт строку с `?sslmode=require`. В коде backend используется опция `ssl: { rejectUnauthorized: false }` для совместимости.

---

# ЧАСТЬ C — Деплой Backend (Web Service) на Render — ПОДРОБНО

1. В Render → **New** → **Web Service** → Connect to GitHub → выберите репозиторий `CargoSNG` и ветку `main`.
2. Конфигурация сервиса:
   - **Name:** `cargosng-backend`
   - **Environment:** Node
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Перейдите в **Environment** (Environment Variables) и добавьте переменные:
   - `DATABASE_URL` = (строка из Render Database, скопированная ранее)
   - `JWT_SECRET` = ваша секретная фраза(siga)
   - `PORT` = `5000` (опционально)
   - `BASE_CURRENCY` = `KZT` (опционально)
   - `CURRENCY_API_URL` = `https://api.exchangerate.host/latest`
   - `ALLOW_ORIGINS` = `https://<your-frontend>.onrender.com`
4. В разделе Health checks укажите endpoint `/api/v1/health`.
5. Нажмите **Create Web Service** — Render выполнит билд и деплой.

Проверка:
```bash
curl https://cargosng-backend-v2.onrender.com/api/v1/health
```

---

# ЧАСТЬ D — Деплой Frontend (Static Site) на Render — ПОДРОБНО

## Вариант 1 — билд на стороне Render (рекомендуется)
1. Render → **New** → **Static Site** → Connect to GitHub.
2. Параметры:
   - **Name:** `cargosng-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `frontend/dist`
3. В Environment добавьте `VITE_API_URL=https://<your-backend>.onrender.com`
4. Создайте сайт — Render соберёт и опубликует фронтенд.

## Вариант 2 — деплой готовой сборки (быстро)
1. Убедитесь, что `frontend/dist` содержит корректный `window.VITE_API_URL` или используйте Render env var.
2. При создании Static Site укажите **Root Directory:** `frontend/dist`, **Publish Directory:** `.` и пустой Build Command.

Отладка:
- Clear cache & Redeploy в настройках Static Site при проблемах с кэшем.

---

# ЧАСТЬ E — Применение миграций (создание таблиц)

### Локально
```bash
cd backend
npm install
cp .env.example .env
# Вставьте DATABASE_URL в .env
npm run migrate
```

### На Render (One-off Job)
1. В Render Dashboard → New → Job (или временно используйте Web Service с командой npm run migrate).
2. Укажите те же env vars (DATABASE_URL).
3. Запустите Job — миграции будут выполнены.

---

# ЧАСТЬ F — Деплой Flutter Web (Static Site) на Render

1. Сборка web-версии:
```bash
cd mobile
flutter pub get
flutter build web --release
```
2. Добавьте `mobile/build/web` в репозиторий или используйте CI, чтобы пушить артефакт.
3. Render → New → Static Site, укажите Root Directory: `mobile/build/web`, Publish Directory: `.`.

---

# ЧАСТЬ G — Публикация Android (Google Play)

1. Создайте keystore:
```bash
keytool -genkey -v -keystore release-key.jks -alias cargosng_key -keyalg RSA -keysize 2048 -validity 10000
```
2. Создайте `mobile/key.properties` (локально) и не коммитьте в репо.
3. Соберите AAB:
```bash
cd mobile
flutter pub get
flutter build appbundle --release --dart-define=API_BASE=https://<your-backend>.onrender.com
```
4. Загрузите AAB в Google Play Console.

---

# ЧАСТЬ H — CI/CD (GitHub Actions)

В `.github/workflows/flutter_build.yml` уже есть пример workflow: сборка web и AAB, загрузка артефактов.
Рекомендуется настроить Secrets в репозитории: `API_BASE`, `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`.

---

# ЧАСТЬ I — Полезные советы

- Не храните секреты в репозитории.
- Используйте Render Jobs / CI для безопасного запуска миграций.
- Мониторьте логи в Render Dashboard → Service → Logs.
- Делайте регулярные бэкапы Postgres.

---
