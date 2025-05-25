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
  };
  logDir: string;
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
  },
  logDir: process.env.LOG_DIR || './logs',
};

export default config;
