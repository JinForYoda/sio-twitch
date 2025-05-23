import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import config from './config/config';
import logger from './utils/logger';
import RtmpServer from './services/rtmp-server';
import Converter from './services/converter';
import StreamManager from './services/stream-manager';
import StreamController from './controllers/stream-controller';
import createStreamRoutes from './routes/stream-routes';

// Загрузка переменных окружения
dotenv.config();

// Создание экземпляра Express
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы
app.use(express.static(path.join(__dirname, '../public')));

// Инициализация сервисов
const rtmpServer = new RtmpServer();
const converter = new Converter();
const streamManager = new StreamManager(rtmpServer, converter);
const streamController = new StreamController(streamManager);

// Маршруты API
app.use('/api/streams', createStreamRoutes(streamController));

// Базовый маршрут
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Обработка ошибок
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({ error: 'Internal server error' });
});

// Запуск сервера
const server = app.listen(config.server.port, () => {
  logger.info(`Server running on http://localhost:${config.server.port}`);

  // Запуск RTMP-сервера
  rtmpServer.start();

  logger.info('RTMP to RTSP converter is ready');
  logger.info(`RTMP endpoint: rtmp://localhost:${config.rtmp.port}/live/{stream-key}`);
  logger.info(`RTSP endpoint: rtsp://localhost:${config.rtsp.port}/live/{stream-key}`);
});

// Обработка завершения работы
const gracefulShutdown = () => {
  logger.info('Shutting down...');

  // Остановка всех потоков
  for (const stream of streamManager.getAllStreams()) {
    streamManager.stopStream(stream.id);
  }

  // Остановка RTMP-сервера
  rtmpServer.stop();

  // Закрытие HTTP-сервера
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  // Принудительное завершение через 10 секунд
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Обработка сигналов завершения
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
