import { Config } from '@remotion/cli/config';

// Render stabil dengan konkurensi 1 sesuai pedoman lomba dan spec
Config.setConcurrency(1);
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(90);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
