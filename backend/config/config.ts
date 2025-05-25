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
  host: 'localhost',
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
    port: Number(process.env.HTTP_PORT),
  },
  webrtc: {
    port: Number(process.env.WEBRTC_PORT),
  },
  mediamtx: {
    apiUrl: `http://${process.env.MEDIAMTX_API_HOST}:${Number(process.env.MEDIAMTX_API_PORT)}/v3`,
  },
  logDir: './logs',
};

export default config;
