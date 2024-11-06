import { Cache, CacheOptions } from '@nestjs/cache-manager';
import { Aspect, LazyDecorator, WrapParams } from '@toss/nestjs-aop';

export const CACHEABLE = Symbol('CACHEABLE');

@Aspect(CACHEABLE)
export class CacheAopProvider implements LazyDecorator<any, CacheOptions> {
  constructor(private readonly cache: Cache) {}

  wrap(params: WrapParams<any, CacheOptions>) {
    return async (...args: any) => {
      const { method, metadata } = params;

      const key = `${method.name.split(' ').at(-1)}:${args.toString()}`;
      let cachedValue = await this.cache.get(key);

      if (!cachedValue) {
        cachedValue = await method(...args);
        await this.cache.set(key, cachedValue, metadata.ttl);
      }

      return cachedValue;
    };
  }
}
