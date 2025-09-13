# CargoSNG Frontend (ESM fixed)

Этот фронтенд исправлен для работы на Render.

## Запуск локально

```bash
npm install
npm run dev
```

Открой http://localhost:5173

## Сборка

```bash
npm run build
```

Результат будет в папке dist/

## Деплой на Render

- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Node Version: 20 (в Render → Environment → Add → NODE_VERSION=20)
- Public Environment: API_URL указывается в `public/config.json`

## Что изменено

- `vite.config.js` заменён на `vite.config.mjs`
- В `package.json` добавлено `"type": "module"`
