import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class DistributedLockProvider {
  private publisher: Redis;
  private subscriber: Redis;
  private lockKey: string;
  private channelName: string;

  constructor() {
    this.publisher = new Redis();
    this.subscriber = new Redis();
  }

  async acquireLock(
    resourceId: string,
    timeout: number = 10000,
  ): Promise<boolean> {
    this.lockKey = `lock:${resourceId}`;
    this.channelName = `lock-channel:${resourceId}`;

    try {
      // 락 획득 시도
      const acquired = await this.publisher.set(
        this.lockKey, // key
        'locked', // value
        'EX', // expiration type (seconds)
        timeout, // expiration time
        'NX', // set if not exists
      );

      if (!acquired) {
        // 락 획득 실패시 채널 구독
        await this.subscriber.subscribe(this.channelName);

        return new Promise((resolve) => {
          this.subscriber.on('message', async (channel, message) => {
            if (channel === this.channelName && message === 'released') {
              // 락 해제 메시지 수신 시 재시도
              await this.subscriber.unsubscribe(this.channelName);
              resolve(await this.acquireLock(resourceId, timeout));
            }
          });
        });
      }

      return true;
    } catch (error) {
      console.error('Lock acquisition failed:', error);
      return false;
    }
  }

  async releaseLock(resourceId: string): Promise<void> {
    const lockKey = `lock:${resourceId}`;
    const channelName = `lock-channel:${resourceId}`;

    try {
      await this.publisher.del(lockKey);
      await this.publisher.publish(channelName, 'released');
    } catch (error) {
      console.error('Lock release failed:', error);
    }
  }
}
