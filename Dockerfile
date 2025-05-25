FROM node:18-alpine

RUN apk add --no-cache g++ make openssl-dev supervisor

RUN mkdir -p /etc/supervisor.d/
COPY supervisord.conf /etc/supervisor.d/supervisord.conf

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install

WORKDIR /app
COPY . .

RUN mkdir -p logs

WORKDIR /app/backend
RUN npm run build

WORKDIR /app/frontend
RUN npm run build

WORKDIR /app

# Используем entrypoint скрипт для запуска приложения
CMD ["supervisord", "-c", "/etc/supervisor.d/supervisord.conf"]
