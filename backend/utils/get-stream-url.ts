import config from '../config/config';

const { host, rtmp, rtsp, http } = config;

export const getRTMPUrl = (streamKey: string): string => {
  return `rtmp://${host}:${rtmp.port}/live/${streamKey}`;
};

export const getRTSPUrl = (streamKey: string): string => {
  return `rtsp://${host}:${rtsp.port}/live/${streamKey}`;
};

export const getHLSUrl = (streamKey: string): string => {
  return `http://${host}:${http.port}/live/${streamKey}/index.m3u8`;
};

export const getWebRTCUrl = (streamKey: string): string => {
  return `http://${host}:${config.webrtc.port}/webrtc/live/${streamKey}`;
};
