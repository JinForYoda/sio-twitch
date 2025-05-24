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
        port: config.http.port,
        allow_origin: '*',
        mediaroot: './media',
      },
      trans: {
        ffmpeg: '/usr/bin/ffmpeg',
        tasks: [
          {
            app: 'live',
            mp4: false,
            hls: true,
            hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
            dash: false,
            dashFlags: '[f=dash:window_size=3:extra_window_size=5]',
          },
        ],
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
