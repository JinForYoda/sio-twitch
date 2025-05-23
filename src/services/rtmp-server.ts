import NodeMediaServer from 'node-media-server';
import config from '../config/config';
import logger from '../utils/logger';
import { EventEmitter } from 'events';

class RtmpServer extends EventEmitter {
  private server: NodeMediaServer;

  constructor() {
    super();

    this.server = new NodeMediaServer({
      rtmp: {
        port: config.rtmp.port,
        chunk_size: config.rtmp.chunkSize,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60,
      },
      http: {
        port: 8000,
        allow_origin: '*',
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.server.on('prePublish', (id: string, streamPath: string, args: any) => {
      logger.info(`RTMP stream published: ${streamPath}`);
      this.emit('streamPublished', { id, streamPath, args });
    });

    this.server.on('donePublish', (id: string, streamPath: string, args: any) => {
      logger.info(`RTMP stream ended: ${streamPath}`);
      this.emit('streamEnded', { id, streamPath, args });
    });

    this.server.on('prePlay', (id: string, streamPath: string, args: any) => {
      logger.info(`RTMP stream requested: ${streamPath}`);
    });

    this.server.on('donePlay', (id: string, streamPath: string, args: any) => {
      logger.info(`RTMP stream play ended: ${streamPath}`);
    });
  }

  public start(): void {
    this.server.run();
    logger.info(`RTMP server running on rtmp://localhost:${config.rtmp.port}`);
  }

  public stop(): void {
    this.server.stop();
    logger.info('RTMP server stopped');
  }

  public getStreamUrl(streamKey: string): string {
    return `rtmp://localhost:${config.rtmp.port}/live/${streamKey}`;
  }
}

export default RtmpServer;
