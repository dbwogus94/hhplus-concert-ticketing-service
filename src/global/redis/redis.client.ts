import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis, { ChainableCommander } from 'ioredis';

@Injectable()
export class RedisClient implements OnModuleDestroy {
  constructor(private readonly redis: Redis) {}

  async onModuleDestroy() {
    await this.redis.quit();
  }

  /**
   * 트랜잭션을 시작합니다.
   * @returns Redis Pipeline
   */
  multi(): ChainableCommander {
    return this.redis.multi();
  }

  /**
   * 키-값을 조회합니다.
   * @param key 키
   * @returns 저장된 값
   */
  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  /**
   * 키-값을 설정
   * @param key 키
   * @param value 값
   * @param ttlSeconds 만료 시간(초)
   * @returns 성공 여부
   */
  async set(key: string, value: string | number): Promise<boolean> {
    const result = await this.redis.set(key, value);
    return result === 'OK';
  }

  /**
   * 키를 삭제합니다.
   * @param key 키
   * @returns 삭제된 키의 수
   */
  async del(key: string): Promise<number> {
    return await this.redis.del(key);
  }

  /**
   * 키-값을 설정하고 만료시간을 지정합니다.
   * @param key 키
   * @param value 값
   * @param ttlSeconds 만료 시간(초)
   * @returns 성공 여부
   */
  async setEX(
    key: string,
    value: string | number,
    { ttlSeconds }: { ttlSeconds?: number } = {},
  ): Promise<boolean> {
    const result = await this.redis.setex(key, ttlSeconds, value);
    // await redis.set(key, value, 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  /**
   * 키가 존재하지 않을 때만 값을 설정합니다.
   * @param key 키 (key)
   * @param value 값 (value)
   * @param ttlSeconds 만료 시간(초)
   * @returns 성공 여부
   */
  async setNX(
    key: string,
    value: string | number,
    { ttlSeconds }: { ttlSeconds?: number } = {},
  ): Promise<boolean> {
    if (ttlSeconds) {
      // SET key value EX seconds NX
      const result = await this.redis.set(key, value, 'EX', ttlSeconds, 'NX');
      return result === 'OK';
    }

    // SET key value NX
    const result = await this.redis.set(key, value, 'NX');
    return result === 'OK';
  }

  /* ---------------------- Set ---------------------- */
  /**
   * Sorted Set에 score와 함께 값을 추가합니다.
   * @param key Sorted Set 키 (key)
   * @param score 점수로 사용될 값
   * @param member 저장할 객체 (value)
   * @returns 추가된 항목 수
   */
  async zadd(key: string, score: number, member: string): Promise<number> {
    return await this.redis.zadd(key, score, member);
  }

  /**
   * Sorted Set에서 범위로 값을 조회합니다.
   * @param key Sorted Set 키
   * @param start 시작 인덱스
   * @param stop 종료 인덱스
   * @returns 조회된 값들
   */
  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    return await this.redis.zrange(key, start, stop);
  }

  /**
   * zrank 순위를 조회 합니다.
   * - 자신을 포함한 순위를 계산 합니다. ( +1 보정 )
   * ex) 앞에 9개가 있다면 10을 리턴합니다.
   * @param key
   * @returns
   */
  async zrank(key: string, token: string): Promise<number> {
    const rank = await this.redis.zrank(key, token);
    return rank === null ? -1 : rank + 1;
  }

  /**
   * zscore 점수를 조회 합니다.
   * @param key
   * @param member - 정학하게 일치하는 해야합니다.
   * @returns
   */
  async zscore(key: string, member: string): Promise<string> {
    return await this.redis.zscore(key, member);
  }

  /* ---------------------- Hash ---------------------- */

  /**
   * Hash에 단일 필드를 설정합니다.
   * - redis는 모든 값을 string로 관리한다. 때문에 값이 들어갔다 나오는 경우 모두 문자열이 리턴된다.
   * @param key Hash 키
   * @param field 필드 이름
   * @param value 값
   * @returns 성공 여부 (새로운 필드면 1, 기존 필드 갱신이면 0)
   */
  async hset(
    key: string,
    field: string,
    value: string | number,
  ): Promise<number> {
    return await this.redis.hset(key, field, value);
  }

  /**
   * Hash에 여러 필드를 한번에 설정합니다.
   * - redis는 모든 값을 string로 관리한다. 때문에 값이 들어갔다 나오는 경우 모두 문자열이 리턴된다.
   * @param key Hash 키
   * @param data 필드-값 쌍의 객체
   * @returns 성공 여부
   */
  async hmset(
    key: string,
    data: Record<string, string | number>,
  ): Promise<boolean> {
    const result = await this.redis.hmset(key, data);
    return result === 'OK';
  }

  /**
   * Hash에서 특정 필드의 값을 조회합니다.
   * @param key Hash 키
   * @param field 필드 이름
   * @returns 필드 값
   */
  async hget(key: string, field: string): Promise<string | null> {
    return await this.redis.hget(key, field);
  }

  /**
   * Hash의 모든 필드-값을 조회합니다.
   * @param key Hash 키
   * @returns 모든 필드-값 쌍
   */
  async hgetall(key: string): Promise<Record<string, string>> {
    return await this.redis.hgetall(key);
  }

  /**
   * Hash에서 특정 필드를 삭제합니다.
   * @param key Hash 키
   * @param field 필드 이름
   * @returns 삭제된 필드 수
   */
  async hdel(key: string, field: string): Promise<number> {
    return await this.redis.hdel(key, field);
  }
}
