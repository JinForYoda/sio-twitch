declare module 'node-media-server' {
  import { EventEmitter } from 'events';

  interface NodeMediaServerConfig {
    rtmp?: {
      port: number;
      chunk_size?: number;
      gop_cache?: boolean;
      ping?: number;
      ping_timeout?: number;
    };
    http?: {
      port: number;
      allow_origin?: string;
    };
    auth?: {
      play?: boolean;
      publish?: boolean;
      secret?: string;
    };
    trans?: {
      ffmpeg?: string;
      tasks?: any[];
    };
  }

  class NodeMediaServer extends EventEmitter {
    constructor(config: NodeMediaServerConfig);
    run(): void;
    stop(): void;
    on(event: string, listener: (...args: any[]) => void): this;
  }

  export = NodeMediaServer;
}
