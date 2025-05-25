import axios from 'axios';
import { EventEmitter } from 'events';
import logger from '../utils/logger';
import config from '../config/config';

interface MediaMtxPath {
  name: string;
  source: {
    type: string;
    id: string;
  };
  ready: boolean;
  tracks: Array<{
    id: number;
    width: number;
    height: number;
    codec: string;
  }>;
  bytesSent: number;
  bytesReceived: number;
}

/**
 * Сервис для работы с MediaMTX API
 */
class MediaMtxService extends EventEmitter {
  private baseUrl: string;
  private apiVersion: string = 'v3';
  private host: string;

  constructor() {
    super();
    // Используем имя сервиса 'mediamtx' как хост в Docker среде
    // или 127.0.0.1 для локальной разработки
    this.host = process.env.DOCKER_ENV === 'true' ? 'mediamtx' : '127.0.0.1';
    this.baseUrl = `http://${this.host}:${config.mediamtx.apiPort}/${this.apiVersion}`;

    logger.info(`MediaMTX service initialized with API at ${this.baseUrl}`);
  }

  /**
   * Получить список активных потоков
   */
  async getPaths(): Promise<MediaMtxPath[] | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/paths/list`);
      return response.data.items || [];
    } catch (error) {
      logger.warn(`Could not connect to MediaMTX API: ${error}`);
      return null;
    }
  }

  /**
   * Проверить, активен ли поток
   */
  async isPathActive(pathName: string): Promise<boolean> {
    try {
      const paths = await this.getPaths();
      if (!paths) return false;
      return paths.some((path) => path.name === pathName && path.ready);
    } catch (error) {
      logger.warn(`Error checking if path ${pathName} is active: ${error}`);
      return false;
    }
  }

  /**
   * Получить информацию о конкретном потоке
   */
  async getPathInfo(pathName: string): Promise<MediaMtxPath | null> {
    try {
      const paths = await this.getPaths();
      if (!paths) return null;
      return paths.find((path) => path.name === pathName) || null;
    } catch (error) {
      logger.warn(`Error getting info for path ${pathName}: ${error}`);
      return null;
    }
  }

  /**
   * Создать конфигурацию для нового потока
   */
  async addPath(pathName: string, options: Record<string, unknown> = {}): Promise<boolean> {
    try {
      await axios.post(`${this.baseUrl}/config/paths/add/${pathName}`, options);
      logger.info(`Path ${pathName} added to MediaMTX`);
      return true;
    } catch (error) {
      logger.error(`Failed to add path ${pathName}: ${error}`);
      return false;
    }
  }

  /**
   * Удалить поток
   */
  async removePath(pathName: string): Promise<boolean> {
    try {
      await axios.post(`${this.baseUrl}/config/paths/remove/${pathName}`);
      logger.info(`Path ${pathName} removed from MediaMTX`);
      return true;
    } catch (error) {
      logger.error(`Failed to remove path ${pathName}: ${error}`);
      return false;
    }
  }

  /**
   * Формирует RTMP URL для потока
   */
  getRtmpUrl(streamKey: string): string {
    return `rtmp://${this.host}:${config.rtmp.port}/live/${streamKey}`;
  }

  /**
   * Формирует RTSP URL для потока
   */
  getRtspUrl(streamKey: string): string {
    return `rtsp://${this.host}:${config.rtsp.port}/live/${streamKey}`;
  }

  /**
   * Формирует HLS URL для потока
   */
  getHlsUrl(streamKey: string): string {
    return `http://${this.host}:${config.http.port}/hls/live/${streamKey}/index.m3u8`;
  }

  /**
   * Формирует WebRTC URL для потока
   */
  getWebRtcUrl(streamKey: string): string {
    return `http://${this.host}:${config.webrtc.port}/webrtc/live/${streamKey}`;
  }

  /**
   * Метод для совместимости с предыдущим RtmpServer
   */
  start(): void {
    logger.info(`RTMP server running on rtmp://${config.host}:${config.rtmp.port}`);
  }

  /**
   * Метод для совместимости с предыдущим RtmpServer
   */
  stop(): void {
    logger.info('RTMP server stopped');
  }
}

export default MediaMtxService;
