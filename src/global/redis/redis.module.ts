import { DynamicModule, Module } from '@nestjs/common';
import { RedisClient } from './redis.client';
import Redis from 'ioredis';

@Module({})
export class RedisModule {
  static forRoot(redis?: Redis): DynamicModule {
    const redisClient = redis
      ? new RedisClient(redis)
      : new RedisClient(new Redis());

    return {
      global: true,
      module: RedisModule,
      providers: [
        {
          provide: RedisClient,
          useValue: redisClient,
        },
      ],
      exports: [RedisClient],
    };
  }
}
