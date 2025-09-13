
# CargoSNG Frontend — Full (Della-like UI)

Это полноценный фронтенд для CargoSNG, стилизованный и организованный по аналогии с порталом доставки (Della.kz) — адаптивная верстка, поиск грузов, карточки, аутентификация и runtime-конфиг.

## Что внутри
- React + Vite проект
- Pages: Home, CargoList, Auth, Dashboard
- Runtime config: `public/config.json` — можно менять API_URL без пересборки
- Простая стилизация и компонентная структура

## Быстрая инструкция (локально)
```bash
# распаковать
cd frontend_full_della
npm install
npm run dev       # разработка
npm run build     # сборка в dist/
npx serve dist    # или npm run preview
```

## Деплой на Render (Static Site)
1. Push в GitHub репозиторий.
2. В Render: New → Static Site → Connect GitHub → выберите репо.
3. Настройки:
   - Root Directory: (корень проекта, где package.json находится)
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. Перед билдом убедитесь, что `public/config.json` содержит корректный `API_URL`, либо добавьте `VITE_API_URL` в Environment и используйте при билде (но runtime-config предпочтительнее).
5. Нажмите Create и после деплоя проверьте сайт.
6. Чтобы изменить адрес backend без пересборки — отредактируйте `config.json` в `dist` (через CI или overwrite статических файлов).

## Runtime config
`public/config.json`:
```json
{ "API_URL": "https://cargosng-backend.onrender.com" }
```

Приложение использует `window.APP_CONFIG` (подгружается перед bootstrap).

## Дальше
- Добавить карты (2ГИС/Яндекс) — в секции Featured можно подключить map provider.
- Улучшить UI по макету della.kz — я могу подготовить точную визуальную тему.
- Интегрировать авторизацию соцсетей, платёжные шлюзы, продвижения заказов.

