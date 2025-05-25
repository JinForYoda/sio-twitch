import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import config from './config/config';
import logger from './utils/logger';
import MediaMtxService from './services/mediamtx-service';
import Converter from './services/converter';
import StreamManager from './services/stream-manager';
import StreamController from './controllers/stream-controller';
import createStreamRoutes from './routes/stream-routes';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../public')));

const rtmpServer = new MediaMtxService();
const converter = new Converter();
const streamManager = new StreamManager(rtmpServer, converter);
const streamController = new StreamController(streamManager);
app.use('/api/streams', createStreamRoutes(streamController));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/frontend/index.html'));
});

app.use((err: Error, req: express.Request, res: express.Response) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(config.server.port, () => {
  logger.info(`Server running on http://localhost:${config.server.port}`);

  rtmpServer.start();

  logger.info('RTMP to RTSP converter is ready');
  logger.info(`RTMP endpoint: rtmp://localhost:${config.rtmp.port}/live/{stream-key}`);
  logger.info(`RTSP endpoint: rtsp://localhost:${config.rtsp.port}/live/{stream-key}`);
});

const gracefulShutdown = () => {
  logger.info('Shutting down...');

  for (const stream of streamManager.getAllStreams()) {
    streamManager.stopStream(stream.id);
  }

  rtmpServer.stop();

  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
