import dotenv from 'dotenv';

dotenv.config();

interface Config {
  server: {
    port: number;
  };
  rtmp: {
    port: number;
    chunkSize: number;
  };
  rtsp: {
    port: number;
  };
  http: {
    port: number;
  };
  ffmpeg: {
    logLevel: string;
    maxRetries: number;
    retryDelayBase: number; // Base delay in ms for retry calculation
    reconnectAttempts: number;
    bufferSize: string;
    videoBitrate: string;
    audioBitrate: string;
  };
}

const config: Config = {
  server: {
    port: Number(process.env.PORT),
  },
  rtmp: {
    port: Number(process.env.RTMP_PORT),
    chunkSize: Number(process.env.RTMP_CHUNK_SIZE),
  },
  rtsp: {
    port: Number(process.env.RTSP_PORT),
  },
  http: {
    port: Number(process.env.HTTP_PORT) || 8080,
  },
  ffmpeg: {
    logLevel: process.env.FFMPEG_LOG_LEVEL ?? 'error',
    maxRetries: Number(process.env.FFMPEG_MAX_RETRIES) || 5,
    retryDelayBase: Number(process.env.FFMPEG_RETRY_DELAY_BASE) || 5000,
    reconnectAttempts: Number(process.env.FFMPEG_RECONNECT_ATTEMPTS) || 3,
    bufferSize: process.env.FFMPEG_BUFFER_SIZE ?? '8192k',
    videoBitrate: process.env.FFMPEG_VIDEO_BITRATE ?? '2000k',
    audioBitrate: process.env.FFMPEG_AUDIO_BITRATE ?? '128k',
  },
};

export default config;
