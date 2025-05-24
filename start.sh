#!/bin/sh

# Запуск frontend сервера
cd /app/public && npm run preview -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!

# Возвращаемся в корневую директорию
cd /app

# Обработка сигналов завершения
trap "kill $FRONTEND_PID; exit 0" SIGTERM SIGINT

# Запуск основного приложения
npm start
