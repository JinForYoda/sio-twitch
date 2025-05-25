import dotenv from 'dotenv';

dotenv.config();

interface Config {
  host: string;
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
  webrtc: {
    port: number;
  };
  mediamtx: {
    apiUrl: string;
  };
  logDir: string;
}

const config: Config = {
  host: process.env.HOST || 'localhost',
  server: {
    port: Number(process.env.PORT) || 3000,
  },
  rtmp: {
    port: Number(process.env.RTMP_PORT) || 1935,
    chunkSize: Number(process.env.RTMP_CHUNK_SIZE) || 60000,
  },
  rtsp: {
    port: Number(process.env.RTSP_PORT) || 8554,
  },
  http: {
    port: Number(process.env.HTTP_PORT) || 8888,
  },
  webrtc: {
    port: Number(process.env.WEBRTC_PORT) || 8889,
  },
  mediamtx: {
    apiUrl: `http://${process.env.MEDIAMTX_API_HOST || 'mediamtx'}:${Number(process.env.MEDIAMTX_API_PORT) || 9997}/v3`,
  },
  logDir: process.env.LOG_DIR || './logs',
};

export default config;
