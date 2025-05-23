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
  ffmpeg: {
    logLevel: string;
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
  ffmpeg: {
    logLevel: process.env.FFMPEG_LOG_LEVEL,
  },
};

export default config;
