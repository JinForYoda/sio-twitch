# RTMP → RTSP Конвертер Frontend

Фронтенд для сервиса конвертации видеопотоков из формата RTMP в формат RTSP.

## Технологии

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui (компоненты интерфейса)

## Разработка

### Установка зависимостей

```bash
cd public
npm install
```

### Запуск в режиме разработки

```bash
npm run dev
```

### Сборка для продакшена

```bash
npm run build
```

## Структура проекта

- `src/` - исходный код приложения
  - `components/` - React компоненты
    - `ui/` - базовые UI компоненты (shadcn/ui)
  - `lib/` - вспомогательные функции
  - `types/` - TypeScript типы
  - `App.tsx` - главный компонент приложения
  - `main.tsx` - точка входа
  - `index.css` - глобальные стили

## Интеграция с бэкендом

Фронтенд взаимодействует с бэкендом через REST API:

- `GET /api/streams` - получить список всех потоков
- `GET /api/streams/:id` - получить информацию о конкретном потоке
- `POST /api/streams` - создать новый поток
- `POST /api/streams/:id/start` - запустить конвертацию потока
- `POST /api/streams/:id/stop` - остановить конвертацию потока
- `DELETE /api/streams/:id` - удалить поток