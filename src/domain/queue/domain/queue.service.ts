import { Injectable } from '@nestjs/common';

import { ActiveQueueRedis, WaitQueueRedis } from '../infra';
import {
  WriteWaitQueueCommand,
  CreateWaitQueueInfo,
  GetWaitQueueInfo,
  FindActiveQueueInfo,
} from './dto';

import { QueueStatus, WaitQueueDomain } from './model';

@Injectable()
export class QueueService {
  constructor(
    private readonly waitQueueRedis: WaitQueueRedis,
    private readonly activeQueueRedis: ActiveQueueRedis,
  ) {}

  async createWaitQueue(
    command: WriteWaitQueueCommand,
  ): Promise<CreateWaitQueueInfo> {
    const { concertId, userId } = command;
    const waitQueue = WaitQueueDomain.from({
      uid: WaitQueueDomain.generateUUIDv4(),
      userId,
      concertId,
      status: QueueStatus.WAIT,
      timestamp: Date.now(),
      waitingNumber: 0,
    });

    await this.waitQueueRedis.inWaitQueue(waitQueue);
    return CreateWaitQueueInfo.of(WaitQueueDomain.from(waitQueue));
  }

  async getWaitQueue(queueUid: string): Promise<GetWaitQueueInfo> {
    const awaitQueue = await this.waitQueueRedis.getWaitQueue(queueUid);
    const waitingNumber =
      await this.waitQueueRedis.getWaitingNumber(awaitQueue);

    return GetWaitQueueInfo.of({ queue: awaitQueue, waitingNumber });
  }

  async findActiveQueue(queueUid: string): Promise<FindActiveQueueInfo | null> {
    const activeQueue = await this.activeQueueRedis.findActiveQueue(queueUid);

    if (activeQueue?.isFirstAccessAfterActive) {
      activeQueue.firstAccess(new Date());
      await this.activeQueueRedis.setExActiveQueue(
        activeQueue.uid,
        activeQueue,
      );
    }

    return activeQueue ? FindActiveQueueInfo.of(activeQueue) : null;
  }

  async expireActiveQueue(queueUid: string) {
    await this.activeQueueRedis.deleteActiveQueue(queueUid);
  }

  /**
   * 유량제어 방식 스케줄러에서 사용하는 메서드
   * @param activeCount
   */
  async batchDeWaitQueuesAndInActiveQueue(activeCount: number): Promise<void> {
    await this.activeQueueRedis.setActiveQueues({
      start: 0,
      stop: activeCount,
    });
  }
}
