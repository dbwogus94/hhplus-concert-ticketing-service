/* eslint-disable @typescript-eslint/no-unused-vars */
import { RedisKey, Callback } from 'ioredis';
import { RedisType } from 'src/common';

export class StubRedis implements RedisType {
  private storage: Map<RedisKey, any> = new Map();

  quit(callback?: Callback<'OK'>): Promise<'OK'> {
    this.storage = new Map();
    return Promise.resolve('OK');
  }

  async get(key: string, callback?: Callback<string | null>): Promise<string> {
    return this.storage.get(key);
  }

  async set(
    key: unknown,
    value: unknown,
    unixTimeMillisecondsToken?: unknown,
    unixTimeMilliseconds?: unknown,
    xx?: unknown,
    get?: unknown,
    callback?: unknown,
  ): Promise<'OK'> {
    this.storage.set(key as string, value);
    return 'OK';
  }

  async setex(
    key: RedisKey,
    seconds: number,
    value: string | Buffer | number,
    callback?: Callback<'OK'>,
  ): Promise<'OK'> {
    // 값 설정
    this.storage.set(key, value);

    // 타이머 설정
    if (seconds) {
      setTimeout(() => {
        this.del(key);
      }, seconds * 1000);
    }
    return 'OK';
  }

  async del(...args: unknown[]): Promise<number> {
    if (typeof args[0] !== 'string' || Buffer.isBuffer(args[0]))
      throw new Error('StubRedis에서는 Key로 문자열만 사용합니다.');

    this.storage.delete(args[0]);
    return;
  }
}
