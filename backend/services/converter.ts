import { StreamStatus } from '@shared/types/stream';
import axios from 'axios';
import { EventEmitter } from 'events';
import { StreamModel } from '../models/Stream';
import logger from '../utils/logger';
import config from 'config/config';

class Converter extends EventEmitter {
  private mediaServerApiUrl: string;
  private host: string;

  constructor() {
    super();
    this.host = config.host;
    this.mediaServerApiUrl = config.mediamtx.apiUrl;
  }

  public async startConversion(stream: StreamModel): Promise<boolean> {
    if (stream.status === StreamStatus.RUNNING) {
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
        const configResponse = await axios.get(`${this.mediaServerApiUrl}/config/global/get`, {
          family: 4
        });
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
      this.updateStreamStatus(stream, StreamStatus.RUNNING);

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
      this.updateStreamStatus(stream, StreamStatus.ERROR);
      this.emit('conversionError', stream.id, error);
      return false;
    }
  }

  public async stopConversion(stream: StreamModel): Promise<boolean> {
    try {
      logger.info(`Stopping stream conversion ${stream.id}`);

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
      logger.info(`Stream ${stream.id} marked as stopped`);

      // Обновляем статус потока
      this.updateStreamStatus(stream, StreamStatus.STOPPED);
      this.emit('conversionStopped', stream.id);
      return true;
    } catch (error) {
      logger.error(`Error stopping stream ${stream.id}: ${error}`);
      return false;
    }
  }

  // public getStream(streamId: string): Stream | undefined {
  //   return this.streams.get(streamId);
  // }

  // public getAllStreams(): Stream[] {
  //   return Array.from(this.streams.values());
  // }

  private updateStreamStatus(stream: StreamModel, status: StreamStatus): void {
    stream.status = status;
    stream.updatedAt = new Date();
    this.emit('streamStatusChanged', stream.id, status);
  }

  // Извлекает ключ потока из URL (например, live/stream1 -> stream1)
  private extractStreamKey(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 1];
  }
}

export default Converter;
