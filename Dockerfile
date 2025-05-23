FROM node:18-alpine

# Установка FFmpeg
RUN apk add --no-cache ffmpeg

# Создание рабочей директории
WORKDIR /app

# Копирование файлов package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm install

# Копирование исходного кода
COPY . .

# Создание директории для логов
RUN mkdir -p logs

# Сборка TypeScript
RUN npm run build

# Открытие портов
EXPOSE 3000 1935 8554

# Запуск приложения
CMD ["npm", "start"]
