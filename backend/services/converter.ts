import { StreamStatus } from '@shared/types/stream';
import axios from 'axios';
import { EventEmitter } from 'events';
import { StreamModel } from '../models/Stream';
import logger from '../utils/logger';
import config from 'config/config';
import { getRTMPUrl, getRTSPUrl, getHLSUrl, getWebRTCUrl } from 'utils/get-stream-url';

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

      const streamKey = this.extractStreamKey(stream.rtmpUrl);

      try {
        const configResponse = await axios.get(`${this.mediaServerApiUrl}/config/global/get`, {
          family: 4,
        });
        logger.info(`MediaMTX API status: ${configResponse.status}`);

        try {
          const pathResponse = await axios.get(`${this.mediaServerApiUrl}/paths/list`);
          logger.info(`Path ${streamKey} status: ${JSON.stringify(pathResponse.data)}`);
        } catch {
          logger.debug(`Path ${streamKey} not found, will be created automatically`);
        }
      } catch (err) {
        logger.warn(`Could not connect to MediaMTX API: ${err}`);
      }

      this.updateStreamStatus(stream, StreamStatus.RUNNING);

      const rtmpUrl = getRTMPUrl(streamKey);
      const rtspUrl = getRTSPUrl(streamKey);
      const hlsUrl = getHLSUrl(streamKey);
      const webrtcUrl = getWebRTCUrl(streamKey);

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

      const streamKey = this.extractStreamKey(stream.rtmpUrl);

      try {
        const pathResponse = await axios.get(`${this.mediaServerApiUrl}/paths/list`);
        logger.info(
          `Path ${streamKey} status before stopping: ${JSON.stringify(pathResponse.data)}`,
        );
      } catch (error) {
        logger.warn(`Could not get status for path ${streamKey}: ${error}`);
      }

      logger.info(`Stream ${stream.id} marked as stopped`);

      this.updateStreamStatus(stream, StreamStatus.STOPPED);
      this.emit('conversionStopped', stream.id);
      return true;
    } catch (error) {
      logger.error(`Error stopping stream ${stream.id}: ${error}`);
      return false;
    }
  }

  private updateStreamStatus(stream: StreamModel, status: StreamStatus): void {
    stream.status = status;
    stream.updatedAt = new Date();
    this.emit('streamStatusChanged', stream.id, status);
  }

  private extractStreamKey(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 1];
  }
}

export default Converter;
