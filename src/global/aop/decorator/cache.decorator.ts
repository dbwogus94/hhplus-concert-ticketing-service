import { CacheOptions } from '@nestjs/cache-manager';
import { createDecorator } from '@toss/nestjs-aop';
import { CACHEABLE } from '../cache-aop.provider';

/**
 * @param options
 * @param options.ttl - 구현된 `RedisCacheStore`는 ioredis를 사용하기 때문에 초(seconds)단위로 넣어야 한다.
 * @returns
 */
export const Cache = (options: CacheOptions) =>
  createDecorator(CACHEABLE, options);
