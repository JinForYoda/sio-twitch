export enum StreamStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  ERROR = 'error',
  STOPPED = 'stopped',
}

export interface Stream {
  id: string;
  name: string;
  rtmpUrl: string;
  hlsUrl: string;
  rtspUrl: string;
  status: StreamStatus;
  createdAt: string;
  updatedAt: string;
}
