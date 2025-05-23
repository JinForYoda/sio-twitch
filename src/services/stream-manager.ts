import { v4 as uuidv4 } from 'uuid';
import { Stream, StreamOptions, StreamStatus } from '../models/stream';
import RtmpServer from './rtmp-server';
import Converter from './converter';
import logger from '../utils/logger';
import config from '../config/config';

class StreamManager {
  private rtmpServer: RtmpServer;
  private converter: Converter;
  private streams: Map<string, Stream> = new Map();

  constructor(rtmpServer: RtmpServer, converter: Converter) {
    this.rtmpServer = rtmpServer;
    this.converter = converter;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Обработка событий от RTMP-сервера
    this.rtmpServer.on('streamPublished', (data) => {
      const streamKey = this.extractStreamKey(data.streamPath);

      // Ищем поток по ключу
      const stream = this.findStreamByKey(streamKey);

      if (stream) {
        logger.info(`Stream published with key ${streamKey}, starting conversion`);
        this.converter.startConversion(stream);
      } else {
        logger.warn(`Unknown stream published with key ${streamKey}`);
      }
    });

    this.rtmpServer.on('streamEnded', (data) => {
      const streamKey = this.extractStreamKey(data.streamPath);
      const stream = this.findStreamByKey(streamKey);

      if (stream) {
        logger.info(`Stream ended with key ${streamKey}, stopping conversion`);
        this.converter.stopConversion(stream.id);
      }
    });

    // Обработка событий от конвертера
    this.converter.on('conversionStarted', (streamId) => {
      const stream = this.streams.get(streamId);
      if (stream) {
        stream.status = StreamStatus.RUNNING;
        stream.updatedAt = new Date();
        this.streams.set(streamId, stream);
      }
    });

    this.converter.on('conversionStopped', (streamId) => {
      const stream = this.streams.get(streamId);
      if (stream) {
        stream.status = StreamStatus.STOPPED;
        stream.updatedAt = new Date();
        this.streams.set(streamId, stream);
      }
    });

    this.converter.on('conversionError', (streamId, error) => {
      const stream = this.streams.get(streamId);
      if (stream) {
        stream.status = StreamStatus.ERROR;
        stream.updatedAt = new Date();
        this.streams.set(streamId, stream);
        logger.error(`Conversion error for stream ${streamId}: ${error}`);
      }
    });
  }

  private extractStreamKey(streamPath: string): string {
    // Формат пути: /live/streamKey
    const parts = streamPath.split('/');
    return parts[parts.length - 1];
  }

  private findStreamByKey(streamKey: string): Stream | undefined {
    for (const stream of this.streams.values()) {
      if (stream.rtmpUrl.endsWith(`/${streamKey}`)) {
        return stream;
      }
    }
    return undefined;
  }

  public createStream(options: StreamOptions): Stream {
    const id = uuidv4();
    const streamKey =
      options.name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + id.substring(0, 8);

    const rtmpUrl = this.rtmpServer.getStreamUrl(streamKey);
    const rtspUrl = `rtsp://localhost:${config.rtsp.port}/live/${streamKey}`;

    const stream: Stream = {
      id,
      name: options.name,
      rtmpUrl: options.rtmpUrl || rtmpUrl,
      rtspUrl,
      status: StreamStatus.IDLE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.streams.set(id, stream);
    logger.info(`Created new stream: ${id}, RTMP: ${stream.rtmpUrl}, RTSP: ${stream.rtspUrl}`);

    return stream;
  }

  public startStream(streamId: string): boolean {
    const stream = this.streams.get(streamId);

    if (!stream) {
      logger.warn(`Stream ${streamId} not found`);
      return false;
    }

    return this.converter.startConversion(stream);
  }

  public stopStream(streamId: string): boolean {
    return this.converter.stopConversion(streamId);
  }

  public getStream(streamId: string): Stream | undefined {
    return this.streams.get(streamId);
  }

  public getAllStreams(): Stream[] {
    return Array.from(this.streams.values());
  }

  public deleteStream(streamId: string): boolean {
    const stream = this.streams.get(streamId);

    if (!stream) {
      return false;
    }

    if (stream.status === StreamStatus.RUNNING) {
      this.converter.stopConversion(streamId);
    }

    this.streams.delete(streamId);
    logger.info(`Deleted stream ${streamId}`);

    return true;
  }
}

export default StreamManager;
