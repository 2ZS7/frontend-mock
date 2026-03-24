# Stateful-VirtualEngine Dashboard

Веб-интерфейс для управления тестовыми сессиями, инспекции логов и настройки правил (Definitions).

## Технологический стек
* **React 18** + **TypeScript**
* **Tailwind CSS v4**
* **Vite** — сборщик проекта
* **Axios** — клиент для API

## Начало работы
1. Установите Node.js (версии 20+).
2. Установите зависимости: `npm install`
3. Запустите сервер разработки: `npm run dev`
4. Приложение будет доступно по адресу: `http://localhost:5173`

## Структура
* `src/pages/` — логика страниц (Dashboard, Inspector, Rules).
* `src/components/` — переиспользуемые UI-элементы.
* `src/services/` — слой доступа к API (api.ts).
