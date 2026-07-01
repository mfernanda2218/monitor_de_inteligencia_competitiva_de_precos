import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

const globalForRedis = global as unknown as {
  redisClient: RedisClientType | undefined;
};

export const redisClient =
  globalForRedis.redisClient ??
  createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redisClient = redisClient;

// Add error listener only if it hasn't been added before
if (redisClient.listenerCount('error') === 0) {
  redisClient.on('error', (err) => console.error('Redis Client Error', err));
}

export async function getRedisClient() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  return redisClient;
}
