import { Router } from 'express';
import StreamController from '../controllers/stream-controller';

const createStreamRoutes = (streamController: StreamController): Router => {
  const router = Router();

  // Маршруты для управления потоками
  router.post('/', streamController.createStream);
  router.get('/', streamController.getStreams);
  router.get('/:id', streamController.getStream);
  router.post('/:id/start', streamController.startStream);
  router.post('/:id/stop', streamController.stopStream);
  router.delete('/:id', streamController.deleteStream);

  return router;
};

export default createStreamRoutes;
