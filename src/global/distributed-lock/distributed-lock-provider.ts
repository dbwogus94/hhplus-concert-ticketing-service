import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class DistributedLockProvider implements OnModuleDestroy {
  private publisher: Redis;
  private subscriber: Redis;

  constructor() {
    this.publisher = new Redis();
    this.subscriber = new Redis();
  }

  async acquireLock(
    resourceId: string,
    timeout: number = 10, // seconds로 변경
  ): Promise<boolean> {
    const lockKey = `lock:${resourceId}`;
    const channelName = `lock-channel:${resourceId}`;

    try {
      // 락 획득 시도
      const acquired = await this.publisher.set(
        lockKey,
        'locked',
        'EX',
        timeout,
        'NX',
      );

      if (!acquired) {
        // 락 획득 실패시 채널 구독
        await this.subscriber.subscribe(channelName);

        return new Promise((resolve, reject) => {
          // 타임아웃 설정
          const timeoutId = setTimeout(async () => {
            await this.subscriber.unsubscribe(channelName);
            resolve(false);
          }, timeout * 1000);

          this.subscriber.on('message', async (channel, message) => {
            if (channel === channelName && message === 'released') {
              clearTimeout(timeoutId);
              await this.subscriber.unsubscribe(channelName);
              // 재귀 호출 대신 새로운 락 획득 시도
              const newAcquired = await this.publisher.set(
                lockKey,
                'locked',
                'EX',
                timeout,
                'NX',
              );
              resolve(newAcquired !== null);
            }
          });

          // 에러 핸들링 추가
          this.subscriber.on('error', async (error) => {
            clearTimeout(timeoutId);
            await this.subscriber.unsubscribe(channelName);
            reject(error);
          });
        });
      }

      return true;
    } catch (error) {
      console.error('Lock acquisition failed:', error);
      throw error; // 에러를 던져서 상위에서 처리할 수 있도록 함
    }
  }

  async releaseLock(resourceId: string): Promise<boolean> {
    const lockKey = `lock:${resourceId}`;
    const channelName = `lock-channel:${resourceId}`;

    try {
      const deleted = await this.publisher.del(lockKey);
      if (deleted) {
        await this.publisher.publish(channelName, 'released');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Lock release failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  async disconnect(): Promise<void> {
    try {
      await Promise.all([this.publisher.quit(), this.subscriber.quit()]);
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  }
}
