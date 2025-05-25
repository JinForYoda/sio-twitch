const host = process.env.HOST;

export const getRTMPUrl = (streamKey: string): string => {
  return `rtmp://${host}:${process.env.RTMP_PORT}/live/${streamKey}`;
};

export const getRTSPUrl = (streamKey: string): string => {
  return `rtsp://${host}:${process.env.RTSP_PORT}/live/${streamKey}`;
};

export const getHLSUrl = (streamKey: string): string => {
  return `http://${host}:${process.env.HTTP_PORT}/live/${streamKey}/index.m3u8`;
};

export const getWebRTCUrl = (streamKey: string): string => {
  return `http://${host}:${process.env.WEBRTC_PORT}/webrtc/live/${streamKey}`;
};
