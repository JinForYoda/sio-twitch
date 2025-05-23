import { spawn } from 'child_process';
import { Stream, StreamStatus } from '../models/stream';
import logger from '../utils/logger';
import config from '../config/config';
import { EventEmitter } from 'events';

class Converter extends EventEmitter {
  private streams: Map<string, Stream> = new Map();

  constructor() {
    super();
  }

  public startConversion(stream: Stream): boolean {
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

      // Запуск FFmpeg для конвертации RTMP в RTSP
      const ffmpegProcess = spawn('ffmpeg', [
        '-loglevel',
        config.ffmpeg.logLevel,
        '-i',
        stream.rtmpUrl,
        '-c:v',
        'copy', // Копировать видеопоток без перекодирования
        '-c:a',
        'copy', // Копировать аудиопоток без перекодирования
        '-f',
        'rtsp', // Формат вывода RTSP
        '-rtsp_transport',
        'tcp', // Использовать TCP для RTSP
        stream.rtspUrl,
      ]);

      // Обработка вывода FFmpeg
      ffmpegProcess.stdout.on('data', (data) => {
        logger.debug(`FFmpeg stdout [${stream.id}]: ${data}`);
      });

      ffmpegProcess.stderr.on('data', (data) => {
        logger.debug(`FFmpeg stderr [${stream.id}]: ${data}`);
      });

      // Обработка завершения процесса FFmpeg
      ffmpegProcess.on('close', (code) => {
        if (code !== 0) {
          logger.error(`FFmpeg process exited with code ${code} for stream ${stream.id}`);
          this.updateStreamStatus(stream.id, StreamStatus.ERROR);
          this.emit('conversionError', stream.id, code);
        } else {
          logger.info(`FFmpeg process completed for stream ${stream.id}`);
          this.updateStreamStatus(stream.id, StreamStatus.STOPPED);
          this.emit('conversionStopped', stream.id);
        }
      });

      // Обработка ошибок процесса FFmpeg
      ffmpegProcess.on('error', (err) => {
        logger.error(`FFmpeg process error for stream ${stream.id}: ${err.message}`);
        this.updateStreamStatus(stream.id, StreamStatus.ERROR);
        this.emit('conversionError', stream.id, err);
      });

      // Сохраняем процесс и обновляем статус
      stream.ffmpegProcess = ffmpegProcess;
      stream.status = StreamStatus.RUNNING;
      stream.updatedAt = new Date();
      this.streams.set(stream.id, stream);

      this.emit('conversionStarted', stream.id);
      return true;
    } catch (error) {
      logger.error(`Error starting conversion for stream ${stream.id}: ${error}`);
      this.updateStreamStatus(stream.id, StreamStatus.ERROR);
      this.emit('conversionError', stream.id, error);
      return false;
    }
  }

  public stopConversion(streamId: string): boolean {
    const stream = this.streams.get(streamId);

    if (!stream || !stream.ffmpegProcess) {
      logger.warn(`Stream ${streamId} is not running or not found`);
      return false;
    }

    try {
      // Завершаем процесс FFmpeg
      stream.ffmpegProcess.kill('SIGTERM');
      logger.info(`Stopped conversion for stream ${streamId}`);

      this.updateStreamStatus(streamId, StreamStatus.STOPPED);
      this.emit('conversionStopped', streamId);
      return true;
    } catch (error) {
      logger.error(`Error stopping conversion for stream ${streamId}: ${error}`);
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
}

export default Converter;
