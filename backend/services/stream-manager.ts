import { Stream, StreamOptions, StreamStatus } from '@shared/types/stream';
import { getHLSUrl, getRTMPUrl, getRTSPUrl } from 'utils/get-stream-url';
import { v4 as uuidv4 } from 'uuid';
import { StreamModel } from '../models/Stream';
import logger from '../utils/logger';
import Converter from './converter';
import MediaMtxService from './mediamtx-service';

class StreamManager {
  private rtmpServer: MediaMtxService;
  private converter: Converter;
  private streams: Map<string, StreamModel> = new Map();

  constructor(rtmpServer: MediaMtxService, converter: Converter) {
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
        this.converter.stopConversion(stream);
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

    const rtmpUrl = options.rtmpUrl || getRTMPUrl(streamKey);

    const rtspUrl = getRTSPUrl(streamKey);

    const hlsUrl = getHLSUrl(streamKey);

    const stream = new StreamModel(id, options.name, rtmpUrl, rtspUrl, hlsUrl);

    this.streams.set(id, stream);
    logger.info(`Created new stream: ${id}`);
    logger.info(`RTMP input: ${stream.rtmpUrl}`);
    logger.info(`RTSP output: ${stream.rtspUrl}`);

    return stream;
  }

  public async startStream(streamId: string): Promise<boolean> {
    const stream = this.streams.get(streamId);

    if (!stream) {
      logger.warn(`Stream ${streamId} not found`);
      return false;
    }

    return await this.converter.startConversion(stream);
  }

  public async stopStream(streamId: string): Promise<boolean> {
    const stream = this.streams.get(streamId);

    if (!stream) {
      logger.warn(`Stream ${streamId} not found`);
      return false;
    }

    return await this.converter.stopConversion(stream);
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
      this.converter.stopConversion(stream);
    }

    this.streams.delete(streamId);
    logger.info(`Deleted stream ${streamId}`);

    return true;
  }
}

export default StreamManager;
