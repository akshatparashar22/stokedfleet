import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  LIVE_FEED_INTERVAL_MS: parseInt(process.env.LIVE_FEED_INTERVAL_MS || '1000', 10),
} as const;
