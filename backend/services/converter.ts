import { Stream, StreamStatus } from '../models/stream';
import logger from '../utils/logger';
import { EventEmitter } from 'events';
import axios from 'axios';

class Converter extends EventEmitter {
  private streams: Map<string, Stream> = new Map();
  private mediaServerApiUrl: string;
  private host: string;

  constructor() {
    super();
    // Определяем URL API MediaMTX сервера
    // В Docker используем имя сервиса или IP, локально - localhost
    // Используем IP-адрес вместо имени хоста, чтобы избежать проблем с DNS
    this.host = process.env.DOCKER_ENV === 'true' ? 'mediamtx' : 'localhost';
    this.mediaServerApiUrl = `http://${this.host}:9997/v3`;
  }

  public async startConversion(stream: Stream): Promise<boolean> {
    if (
      this.streams.has(stream.id) &&
      this.streams.get(stream.id)?.status === StreamStatus.RUNNING
    ) {
      logger.warn(`Stream ${stream.id} is already running`);
      return false;
    }

    try {
      logger.info(
        `Starting conversion for stream ${stream.id}: ${stream.rtmpUrl} -> ${stream.rtspUrl}`,
      );

      // Получаем ключ потока из URL
      const streamKey = this.extractStreamKey(stream.rtmpUrl);

      // Проверяем статус API MediaMTX
      try {
        // Проверяем, доступен ли API MediaMTX
        const configResponse = await axios.get(`${this.mediaServerApiUrl}/config/global/get`);
        logger.info(`MediaMTX API status: ${configResponse.status}`);

        // Проверяем, существует ли уже поток с таким ключом
        try {
          const pathResponse = await axios.get(`${this.mediaServerApiUrl}/paths/list`);
          logger.info(`Path ${streamKey} status: ${JSON.stringify(pathResponse.data)}`);
        } catch {
          // Если путь не найден, это нормально - он будет создан автоматически
          logger.debug(`Path ${streamKey} not found, will be created automatically`);
        }
      } catch (err) {
        logger.warn(`Could not connect to MediaMTX API: ${err}`);
        // Продолжаем работу, так как MediaMTX может работать без API
      }

      // Обновляем статус потока
      this.updateStreamStatus(stream.id, StreamStatus.RUNNING);

      // Формируем URL для разных протоколов на основе streamKey
      const rtmpUrl = `rtmp://${this.host}:1935/live/${streamKey}`;
      const rtspUrl = `rtsp://${this.host}:8554/live/${streamKey}`;
      const hlsUrl = `http://${this.host}:8888/hls/live/${streamKey}/index.m3u8`;
      const webrtcUrl = `http://${this.host}:8889/webrtc/live/${streamKey}`;

      logger.info(
        `Stream ${stream.id} is available at:\n` +
          `  RTMP: ${rtmpUrl}\n` +
          `  RTSP: ${rtspUrl}\n` +
          `  HLS: ${hlsUrl}\n` +
          `  WebRTC: ${webrtcUrl}`,
      );

      this.emit('conversionStarted', stream.id);
      return true;
    } catch (error) {
      logger.error(`Error starting stream ${stream.id}: ${error}`);
      this.updateStreamStatus(stream.id, StreamStatus.ERROR);
      this.emit('conversionError', stream.id, error);
      return false;
    }
  }

  public async stopConversion(streamId: string): Promise<boolean> {
    const stream = this.streams.get(streamId);

    if (!stream) {
      logger.warn(`Stream ${streamId} is not running or not found`);
      return false;
    }

    try {
      logger.info(`Stopping stream conversion ${streamId}`);

      // Получаем ключ потока из URL
      const streamKey = this.extractStreamKey(stream.rtmpUrl);

      try {
        // Проверяем состояние потока в MediaMTX
        const pathResponse = await axios.get(`${this.mediaServerApiUrl}/paths/list`);
        logger.info(
          `Path ${streamKey} status before stopping: ${JSON.stringify(pathResponse.data)}`,
        );
      } catch (error) {
        logger.warn(`Could not get status for path ${streamKey}: ${error}`);
      }

      // Медиа-сервер автоматически остановит поток, когда источник прекратит публикацию
      // Мы просто обновляем статус в нашей системе
      logger.info(`Stream ${streamId} marked as stopped`);

      // Обновляем статус потока
      this.updateStreamStatus(streamId, StreamStatus.STOPPED);
      this.emit('conversionStopped', streamId);
      return true;
    } catch (error) {
      logger.error(`Error stopping stream ${streamId}: ${error}`);
      return false;
    }
  }

  public getStream(streamId: string): Stream | undefined {
    return this.streams.get(streamId);
  }

  public getAllStreams(): Stream[] {
    return Array.from(this.streams.values());
  }

  public updateStreamStatus(streamId: string, status: StreamStatus): void {
    const stream = this.streams.get(streamId);

    if (stream) {
      stream.status = status;
      stream.updatedAt = new Date();
      this.streams.set(streamId, stream);
      this.emit('streamStatusChanged', streamId, status);
    }
  }

  // Извлекает ключ потока из URL (например, live/stream1 -> stream1)
  private extractStreamKey(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 1];
  }
}

export default Converter;
