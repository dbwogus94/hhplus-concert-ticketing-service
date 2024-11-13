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

  async findWaitQueue(queueUid: string): Promise<GetWaitQueueInfo> {
    const consertId = 1; // TODO: 임시
    const awaitQueue = await this.waitQueueRedis.findWaitQueue(
      consertId,
      queueUid,
    );
    return GetWaitQueueInfo.of(awaitQueue);
  }

  async findActiveQueue(queueUid: string): Promise<FindActiveQueueInfo | null> {
    const activeQueue = await this.activeQueueRedis.findActiveQueue(queueUid);

    if (activeQueue?.isFirstAccessAfterActive) {
      activeQueue.firstAccess(new Date());
      await this.activeQueueRedis.setExActiveQueue(activeQueue);
    }
    return activeQueue ? FindActiveQueueInfo.of(activeQueue) : null;
  }

  async expireActiveQueue(queueUid: string) {
    await this.activeQueueRedis.deActiveQueue(1, queueUid);
  }

  /**
   * 유량제어 방식 스케줄러에서 사용하는 메서드
   * @param activeCount
   */
  async batchDeWaitQueuesAndInActiveQueue(activeCount: number): Promise<void> {
    const consertId = 1; // TODO: 임시
    await this.activeQueueRedis.inActiveQueueWithTx(consertId, {
      start: 0,
      stop: activeCount,
    });
  }
}
