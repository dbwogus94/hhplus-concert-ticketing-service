import { RedlockMutex, RedlockSemaphore } from 'redis-semaphore';
import Redis from 'ioredis';

export class DistributedLockProvider {
  private redisClients: Redis[];

  constructor() {
    this.redisClients = [new Redis()];
  }

  async withMutex<T>(key: string, callback: () => Promise<T>): Promise<T> {
    const mutex = new RedlockMutex(this.redisClients, key, {
      lockTimeout: 10000, // 락 타임아웃, 10초
      retryInterval: 500, // 재시도 간격, 0.5초
      refreshInterval: 5000, // 락 타임아웃 안되게 갱신 간격, 5초
    });

    try {
      await mutex.acquire();
      return await callback();
    } finally {
      await mutex.release();
    }
  }

  /**
   * 세마포어 방식으로 동시에 limit 개수 만큼 접근 가능하다.
   * @param key
   * @param limit
   * @param callback
   * @returns
   */
  async withSemaphore<T>(
    key: string,
    limit: number,
    callback: () => Promise<T>,
  ): Promise<T> {
    const semaphore = new RedlockSemaphore(this.redisClients, key, limit, {
      lockTimeout: 10000,
      retryInterval: 100,
    });

    try {
      await semaphore.acquire();
      return await callback();
    } finally {
      await semaphore.release();
    }
  }

  async disconnect(): Promise<void> {
    await Promise.all(
      this.redisClients.map(async (client) => {
        await client.quit(); // graceful shutdown
      }),
    );
  }
}
