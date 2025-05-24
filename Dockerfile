FROM node:18-alpine

# Установка FFmpeg
RUN apk add --no-cache ffmpeg

# Создание рабочей директории
WORKDIR /app

# Копирование файлов package.json и package-lock.json для бэкенда
COPY package*.json ./

# Установка зависимостей для бэкенда
RUN npm install

# Копирование файлов package.json и package-lock.json для фронтенда
COPY public/package*.json ./public/

# Установка зависимостей для фронтенда
WORKDIR /app/public
RUN npm install

# Возвращаемся в корневую директорию
WORKDIR /app

# Копирование исходного кода
COPY . .

# Создание директории для логов
RUN mkdir -p logs

# Сборка TypeScript для бэкенда
RUN npm run build

# Сборка фронтенда
WORKDIR /app/public
RUN npm run build

# Возвращаемся в корневую директорию
WORKDIR /app

# Открытие портов (бэкенд, RTMP, RTSP, frontend)
EXPOSE 3000 1935 8554 5173

# Создаем скрипт для запуска обоих сервисов
RUN echo '#!/bin/sh\n\
cd /app/public && npm run preview -- --host 0.0.0.0 --port 5173 & \n\
FRONTEND_PID=$!\n\
cd /app\n\
trap "kill $FRONTEND_PID; exit 0" SIGTERM SIGINT\n\
npm start\n\
' > /app/start.sh && chmod +x /app/start.sh

# Запуск приложения
CMD ["/app/start.sh"]
