export interface Stream {
  id: string;
  name: string;
  rtmpUrl: string;
  rtspUrl: string;
  status: StreamStatus;
  createdAt: Date;
  updatedAt: Date;
  ffmpegProcess?: any; // Процесс FFmpeg
}

export enum StreamStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  ERROR = 'error',
  STOPPED = 'stopped',
}

export interface StreamOptions {
  name: string;
  rtmpUrl: string;
}
