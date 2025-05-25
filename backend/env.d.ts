declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    RTMP_PORT: string;
    RTMP_CHUNK_SIZE: string;
    RTSP_PORT: string;
    LOG_LEVEL: string;
    FFMPEG_LOG_LEVEL: string;
  }
}
