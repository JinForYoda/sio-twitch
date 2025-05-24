import { spawn } from 'child_process';
import { Stream, StreamStatus } from '../models/stream';
import logger from '../utils/logger';
import config from '../config/config';
import { EventEmitter } from 'events';

class Converter extends EventEmitter {
  private streams: Map<string, Stream> = new Map();
  private retryCounters: Map<string, number> = new Map();
  private maxRetries: number = config.ffmpeg.maxRetries; // Максимальное количество попыток перезапуска

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

    // Validate input parameters
    if (!stream.rtmpUrl || !stream.rtspUrl) {
      logger.error(`Invalid stream configuration for stream ${stream.id}: RTMP or RTSP URL is missing`);
      this.updateStreamStatus(stream.id, StreamStatus.ERROR);
      this.emit('conversionError', stream.id, new Error('Invalid stream configuration'));
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
        // Добавляем параметры для улучшения обработки ошибок ввода/вывода
        '-err_detect',
        'ignore_err', // Игнорировать некоторые ошибки декодирования
        '-fflags',
        '+discardcorrupt+genpts+igndts', // Отбрасывать поврежденные пакеты, генерировать PTS и игнорировать DTS
        // Увеличиваем размер буфера для входного потока
        '-analyzeduration',
        '2147483647', // Максимальное время анализа входного потока
        '-probesize',
        config.ffmpeg.bufferSize, // Размер буфера для анализа входного потока
        // Добавляем параметры для улучшения стабильности соединения
        '-i',
        stream.rtmpUrl,
        // Настройки видео кодека
        '-c:v',
        'libx264', // Использовать H.264 кодек для видео вместо копирования
        '-preset',
        'ultrafast', // Быстрое кодирование
        '-tune',
        'zerolatency', // Оптимизация для низкой задержки
        '-profile:v',
        'baseline', // Базовый профиль для лучшей совместимости
        '-level',
        '3.0', // Уровень совместимости
        '-maxrate',
        config.ffmpeg.videoBitrate, // Максимальный битрейт
        '-bufsize',
        (parseInt(config.ffmpeg.videoBitrate.replace(/[^0-9]/g, '')) * 2).toString() + 'k', // Размер буфера для контроля битрейта (2x от битрейта)
        '-pix_fmt',
        'yuv420p', // Формат пикселей для лучшей совместимости
        // Настройки аудио кодека
        '-c:a',
        'aac', // Использовать AAC кодек для аудио вместо копирования
        '-ar',
        '44100', // Частота дискретизации аудио
        '-b:a',
        config.ffmpeg.audioBitrate, // Битрейт аудио
        // Настройки выходного потока
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

      // Улучшенная обработка ошибок FFmpeg
      ffmpegProcess.stderr.on('data', (data) => {
        const dataStr = data.toString();
        logger.debug(`FFmpeg stderr [${stream.id}]: ${dataStr}`);

        // Анализируем вывод ошибок для выявления конкретных проблем
        if (dataStr.includes('Connection refused') || dataStr.includes('Connection timed out')) {
          logger.warn(`FFmpeg connection issue detected for stream ${stream.id}: ${dataStr.trim()}`);
        } else if (dataStr.includes('Error while opening encoder') || dataStr.includes('Codec not found')) {
          logger.warn(`FFmpeg codec issue detected for stream ${stream.id}: ${dataStr.trim()}`);
        } else if (dataStr.includes('Invalid data found') || dataStr.includes('Error while decoding')) {
          logger.warn(`FFmpeg data format issue detected for stream ${stream.id}: ${dataStr.trim()}`);
        } else if (dataStr.includes('No such file or directory') || dataStr.includes('Permission denied')) {
          logger.warn(`FFmpeg file access issue detected for stream ${stream.id}: ${dataStr.trim()}`);
        } else if (dataStr.includes('Input/output error') || dataStr.includes('End of file')) {
          logger.warn(`FFmpeg I/O error detected for stream ${stream.id}: ${dataStr.trim()}`);
        } else if (dataStr.includes('Invalid argument') || dataStr.includes('Option not found')) {
          logger.warn(`FFmpeg configuration issue detected for stream ${stream.id}: ${dataStr.trim()}`);
        }
      });

      // Обработка завершения процесса FFmpeg
      ffmpegProcess.on('close', (code) => {
        if (code !== 0) {
          let errorMessage = `FFmpeg process exited with code ${code} for stream ${stream.id}`;

          // Добавляем более подробную информацию о распространенных кодах ошибок FFmpeg
          switch (code) {
            case 1:
              errorMessage += ': General error';
              break;
            case 8:
              errorMessage += ': Input/output error - possible file access issue or invalid input format';
              break;
            case 145:
              errorMessage += ': Possible codec compatibility issue or connection problem';
              break;
            case 255:
              errorMessage += ': External termination requested';
              break;
            default:
              errorMessage += ': Unknown error';
          }

          logger.error(errorMessage);

          // Для некоторых ошибок можно попробовать перезапустить конвертацию
          if (code === 145 || code === 8) {
            // Увеличиваем счетчик попыток для этого потока
            const currentRetries = this.retryCounters.get(stream.id) || 0;

            if (currentRetries < this.maxRetries) {
              this.retryCounters.set(stream.id, currentRetries + 1);
              logger.info(`Attempting to restart conversion for stream ${stream.id} after error (attempt ${currentRetries + 1}/${this.maxRetries})`);

              // Увеличиваем задержку перед перезапуском в зависимости от номера попытки
              const retryDelay = (currentRetries + 1) * config.ffmpeg.retryDelayBase; // Увеличиваем задержку с каждой попыткой
              logger.info(`Scheduling retry for stream ${stream.id} in ${retryDelay/1000} seconds`);

              setTimeout(() => {
                // Проверяем, что поток все еще существует и не был остановлен вручную
                const currentStream = this.streams.get(stream.id);
                if (currentStream && currentStream.status !== StreamStatus.STOPPED) {
                  logger.info(`Executing retry attempt ${currentRetries + 1} for stream ${stream.id}`);
                  this.startConversion(currentStream);
                } else {
                  logger.info(`Retry cancelled for stream ${stream.id}: stream was stopped or removed`);
                }
              }, retryDelay); // Прогрессивная задержка
            } else {
              logger.error(`Maximum retry attempts (${this.maxRetries}) reached for stream ${stream.id}, giving up`);
              this.updateStreamStatus(stream.id, StreamStatus.ERROR);
              this.emit('conversionError', stream.id, code);
            }
          } else {
            this.updateStreamStatus(stream.id, StreamStatus.ERROR);
            this.emit('conversionError', stream.id, code);
          }
        } else {
          logger.info(`FFmpeg process completed for stream ${stream.id}`);

          // Сбрасываем счетчик попыток при успешном завершении
          this.retryCounters.set(stream.id, 0);

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

      // Сбрасываем счетчик попыток при успешном запуске
      this.retryCounters.set(stream.id, 0);

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

      // Сбрасываем счетчик попыток при остановке потока
      this.retryCounters.set(streamId, 0);

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

  /**
   * Очищает счетчик попыток перезапуска для указанного потока
   * @param streamId ID потока
   */
  public clearRetryCounter(streamId: string): void {
    if (this.retryCounters.has(streamId)) {
      this.retryCounters.delete(streamId);
      logger.debug(`Cleared retry counter for stream ${streamId}`);
    }
  }
}

export default Converter;
