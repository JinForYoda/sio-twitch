export interface Stream {
  id: string;
  name: string;
  rtmpUrl: string;
  rtspUrl: string;
  hlsUrl: string;
  status: StreamStatus;
  createdAt: Date;
  updatedAt: Date;
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
