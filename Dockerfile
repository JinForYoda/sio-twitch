FROM node:18-alpine

# Установка необходимых зависимостей
RUN apk add --no-cache git g++ make cmake perl-dev openssl-dev
# Установка SRS из предварительно собранного пакета
RUN apk add --no-cache nginx

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

# Копируем скрипт запуска
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Запуск приложения
CMD ["/app/start.sh"]
