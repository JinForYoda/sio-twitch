import { Stream, StreamStatus } from '@shared/types/stream';

export class StreamModel implements Stream {
    constructor(
        public id: string,
        public name: string,
        public rtmpUrl: string,
        public rtspUrl: string,
        public hlsUrl: string,
        public status: StreamStatus = StreamStatus.IDLE,
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date(),
    ) {}
}