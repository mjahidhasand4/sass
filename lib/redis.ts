import Redis from 'ioredis';

// Environment variables with fallbacks for development
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisPassword = process.env.REDIS_PASSWORD || '';

// Configuration options
const redisOptions = {
  password: redisPassword,
  retryStrategy: (times: number) => {
    // Exponential backoff with max delay of 10 seconds
    const delay = Math.min(times * 50, 10000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  connectTimeout: 10000,
};

// Create Redis client instance
let redisClient: Redis | null = null;

/**
 * Get Redis client instance (creates one if it doesn't exist)
 */
export const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis(redisUrl, redisOptions);
    
    // Error handling
    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
    
    // Connection events
    redisClient.on('connect', () => {
      console.log('Redis client connected');
    });
    
    redisClient.on('reconnecting', () => {
      console.log('Redis client reconnecting');
    });
  }
  
  return redisClient;
};

/**
 * Close Redis connection
 */
export const closeRedisConnection = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('Redis connection closed');
  }
};

/**
 * Set a key with optional expiration
 */
export const setCache = async (
  key: string, 
  value: string | number | object, 
  expiryInSeconds?: number
): Promise<'OK'> => {
  const client = getRedisClient();
  const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
  
  if (expiryInSeconds) {
    return client.set(key, stringValue, 'EX', expiryInSeconds);
  }
  
  return client.set(key, stringValue);
};

/**
 * Get a value by key
 */
export const getCache = async <T = string>(key: string): Promise<T | null> => {
  const client = getRedisClient();
  const value = await client.get(key);
  
  if (!value) return null;
  
  try {
    // Attempt to parse as JSON
    return JSON.parse(value) as T;
  } catch (e) {
    // Return as is if not JSON
    return value as unknown as T;
  }
};

/**
 * Delete a key
 */
export const deleteCache = async (key: string): Promise<number> => {
  const client = getRedisClient();
  return client.del(key);
};

/**
 * Check if a key exists
 */
export const hasKey = async (key: string): Promise<boolean> => {
  const client = getRedisClient();
  const result = await client.exists(key);
  return result === 1;
};

/**
 * Set key expiration time
 */
export const setExpiry = async (key: string, expiryInSeconds: number): Promise<number> => {
  const client = getRedisClient();
  return client.expire(key, expiryInSeconds);
};

/**
 * Increment a counter
 */
export const increment = async (key: string, by: number = 1): Promise<number> => {
  const client = getRedisClient();
  return client.incrby(key, by);
};

/**
 * Flush all data (use with caution)
 */
export const flushAll = async (): Promise<'OK'> => {
  const client = getRedisClient();
  return client.flushall();
};
