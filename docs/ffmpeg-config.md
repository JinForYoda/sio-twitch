# FFmpeg Configuration Guide

This document describes the environment variables that can be used to configure FFmpeg in the application.

## Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `FFMPEG_LOG_LEVEL` | Log level for FFmpeg (error, warning, info, debug) | error |
| `FFMPEG_MAX_RETRIES` | Maximum number of retry attempts for failed conversions | 5 |
| `FFMPEG_RETRY_DELAY_BASE` | Base delay in milliseconds for retry calculation | 5000 |
| `FFMPEG_RECONNECT_ATTEMPTS` | Maximum number of reconnection attempts for FFmpeg | 3 |
| `FFMPEG_BUFFER_SIZE` | Buffer size for FFmpeg input | 8192k |
| `FFMPEG_VIDEO_BITRATE` | Video bitrate for encoding | 2000k |
| `FFMPEG_AUDIO_BITRATE` | Audio bitrate for encoding | 128k |

## Retry Mechanism

When a stream fails with certain error codes, the application will attempt to restart the conversion. The retry mechanism applies to the following error codes:

- **Error code 8**: Input/output error - possible file access issue or invalid input format
- **Error code 145**: Possible codec compatibility issue or connection problem

The retry mechanism works as follows:

1. The application will retry up to `FFMPEG_MAX_RETRIES` times (default: 5)
2. Each retry will have a progressively longer delay:
   - First retry: `FFMPEG_RETRY_DELAY_BASE` milliseconds (default: 5000ms = 5s)
   - Second retry: 2 × `FFMPEG_RETRY_DELAY_BASE` milliseconds (default: 10s)
   - Third retry: 3 × `FFMPEG_RETRY_DELAY_BASE` milliseconds (default: 15s)
   - And so on...

## FFmpeg Parameters

The application uses the following FFmpeg parameters for RTMP to RTSP conversion:

### Input Parameters
- Analysis duration: Maximum time to spend analyzing the input stream
- Probe size: `FFMPEG_BUFFER_SIZE` (default: 8192k) for input stream analysis
- Error detection: `ignore_err` to continue processing despite certain decoding errors
- Flags: 
  - `discardcorrupt` to discard corrupted packets
  - `genpts` to generate presentation timestamps
  - `igndts` to ignore problematic DTS timestamps

### Video Parameters
- Video codec: libx264 with baseline profile and level 3.0
- Video preset: ultrafast
- Video tune: zerolatency
- Video bitrate: `FFMPEG_VIDEO_BITRATE` (default: 2000k)
- Pixel format: yuv420p for maximum compatibility

### Audio Parameters
- Audio codec: aac
- Audio sample rate: 44100 Hz
- Audio bitrate: `FFMPEG_AUDIO_BITRATE` (default: 128k)

### Output Parameters
- Format: RTSP
- Transport: TCP

## Common FFmpeg Error Codes

Here are some common FFmpeg error codes you might encounter and their meanings:

| Error Code | Description | Possible Solutions |
|------------|-------------|-------------------|
| 1 | General error | Check FFmpeg logs for specific details |
| 8 | Input/output error | Check file permissions, network connectivity, or input format |
| 145 | Codec compatibility or connection issue | Verify stream source is available, check codec settings |
| 255 | External termination requested | Normal if the stream was manually stopped |

## Troubleshooting

If you're experiencing issues with FFmpeg conversions, try the following:

### For Exit Code 8 (Input/Output Error)
1. Verify that the input RTMP stream is valid and accessible
2. Check that the FFmpeg version installed supports all the options used in the command
3. Increase `FFMPEG_BUFFER_SIZE` to allow more time for analyzing problematic streams
4. Set `FFMPEG_LOG_LEVEL` to "debug" to see detailed error messages
5. Ensure that there are no network issues or firewall rules blocking the connection
6. Check for file system permissions if accessing local files

### For Exit Code 145 (Codec Compatibility or Connection Issues)
1. Verify that the source stream is using a compatible codec
2. Decrease `FFMPEG_VIDEO_BITRATE` if the network connection is unstable
3. Try using a different codec preset (e.g., change from 'ultrafast' to 'fast')
4. Ensure that the required codec libraries are installed

### General Troubleshooting
1. Increase `FFMPEG_MAX_RETRIES` to give more chances for the conversion to succeed
2. Increase `FFMPEG_RETRY_DELAY_BASE` to give more time between retry attempts
3. Verify that the output RTSP path is writable and not already in use
4. Check system resources (CPU, memory) to ensure they are not bottlenecks
5. Update FFmpeg to the latest version if possible
