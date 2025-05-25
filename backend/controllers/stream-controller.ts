import { Request, Response } from 'express';
import { StreamOptions } from '@shared/types/stream';
import StreamManager from '../services/stream-manager';
import logger from '../utils/logger';

class StreamController {
  private streamManager: StreamManager;

  constructor(streamManager: StreamManager) {
    this.streamManager = streamManager;
  }

  public createStream = (req: Request, res: Response): void => {
    try {
      const streamOptions: StreamOptions = req.body;

      if (!streamOptions.name) {
        res.status(400).json({ error: 'Stream name is required' });
        return;
      }

      const stream = this.streamManager.createStream(streamOptions);
      res.status(201).json(stream);
    } catch (error) {
      logger.error(`Error creating stream: ${error}`);
      res.status(500).json({ error: 'Failed to create stream' });
    }
  };

  public getStreams = (req: Request, res: Response): void => {
    try {
      const streams = this.streamManager.getAllStreams();
      res.json(streams);
    } catch (error) {
      logger.error(`Error getting streams: ${error}`);
      res.status(500).json({ error: 'Failed to get streams' });
    }
  };

  public getStream = (req: Request, res: Response): void => {
    try {
      const streamId = req.params.id;
      const stream = this.streamManager.getStream(streamId);

      if (!stream) {
        res.status(404).json({ error: 'Stream not found' });
        return;
      }

      res.json(stream);
    } catch (error) {
      logger.error(`Error getting stream: ${error}`);
      res.status(500).json({ error: 'Failed to get stream' });
    }
  };

  public startStream = async (req: Request, res: Response): Promise<void> => {
    try {
      const streamId = req.params.id;
      const success = await this.streamManager.startStream(streamId);

      if (!success) {
        res.status(400).json({ error: 'Failed to start stream' });
        return;
      }

      res.json({ success: true });
    } catch (error) {
      logger.error(`Error starting stream: ${error}`);
      res.status(500).json({ error: 'Failed to start stream' });
    }
  };

  public stopStream = async (req: Request, res: Response): Promise<void> => {
    try {
      const streamId = req.params.id;
      const success = await this.streamManager.stopStream(streamId);

      if (!success) {
        res.status(400).json({ error: 'Failed to stop stream' });
        return;
      }

      res.json({ success: true });
    } catch (error) {
      logger.error(`Error stopping stream: ${error}`);
      res.status(500).json({ error: 'Failed to stop stream' });
    }
  };

  public deleteStream = (req: Request, res: Response): void => {
    try {
      const streamId = req.params.id;
      const success = this.streamManager.deleteStream(streamId);

      if (!success) {
        res.status(404).json({ error: 'Stream not found' });
        return;
      }

      res.json({ success: true });
    } catch (error) {
      logger.error(`Error deleting stream: ${error}`);
      res.status(500).json({ error: 'Failed to delete stream' });
    }
  };
}

export default StreamController;
