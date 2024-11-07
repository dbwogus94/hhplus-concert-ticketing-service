import { CacheStore } from '@nestjs/cache-manager';
import { OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

export type RedisType = Pick<Redis, 'get' | 'set' | 'setex' | 'del' | 'quit'>;

export abstract class BaseCacheStore implements CacheStore {
  abstract get<T>(key: string): Promise<T | undefined> | T | undefined;
  abstract set<T>(key: string, value: T, ttl?: number): Promise<void> | void;
  abstract del?(key: string): void | Promise<void>;
}

export class RedisCacheStore extends BaseCacheStore implements OnModuleDestroy {
  constructor(private readonly redisClient: RedisType) {
    super();
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
  }

  override async get<T>(key: string): Promise<T | null> {
    const value = await this.redisClient.get(key);
    return value ? JSON.parse(value) : null;
  }

  /**
   *
   * @param key
   * @param value
   * @param ttl - `redisClient` ioredis를 사용하는 경우 초(seconds)단위만 사용가능하다.
   */
  override async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const stringValue = JSON.stringify(value);

    if (ttl) {
      await this.redisClient.setex(key, ttl, stringValue);
    } else {
      await this.redisClient.set(key, stringValue);
    }
  }

  override async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}
