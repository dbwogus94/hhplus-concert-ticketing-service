import { CacheStore } from '@nestjs/cache-manager';
import { Redis } from 'ioredis';

export class RedisCacheStore implements CacheStore {
  constructor(private readonly redisClient: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redisClient.get(key);
    return value ? JSON.parse(value) : null;
  }

  /**
   *
   * @param key
   * @param value
   * @param ttl - `redisClient` ioredis를 사용하는 경우 초(seconds)단위만 사용가능하다.
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const stringValue = JSON.stringify(value);

    if (ttl) {
      await this.redisClient.setex(key, ttl, stringValue);
    } else {
      await this.redisClient.set(key, stringValue);
    }
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}
