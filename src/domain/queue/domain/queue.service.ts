import { Injectable } from '@nestjs/common';

import { ActiveQueueRedis, WaitQueueRedis } from '../infra';
import {
  WriteWaitQueueCommand,
  CreateWaitQueueInfo,
  GetWaitQueueInfo,
  FindActiveQueueInfo,
} from './dto';

import { ActiveQueueDomain, QueueStatus, WaitQueueDomain } from './model';

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
    return awaitQueue ? GetWaitQueueInfo.of(awaitQueue) : null;
  }

  async findActiveQueue(queueUid: string): Promise<FindActiveQueueInfo | null> {
    const consertId = 1; // TODO: 임시
    const activeQueue = await this.activeQueueRedis.findActiveQueue(
      consertId,
      queueUid,
    );

    // if (activeQueue?.isFirstAccessAfterActive) {
    //   activeQueue.firstAccess(new Date());
    //   await this.activeQueueRedis.setExActiveQueue(activeQueue);
    // }
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
    const waitQueues = await this.waitQueueRedis.getWaitQueues(consertId, {
      start: 0,
      stop: activeCount,
    });

    // 대기열 제거
    await this.waitQueueRedis.deWaitQueueWithTx(waitQueues);

    // 사용열 추가
    const activeQueues = waitQueues.map((wq) =>
      ActiveQueueDomain.from({ ...wq.toLiteral() }),
    );
    await this.activeQueueRedis.inActiveQueuesWithTx(activeQueues);
  }
}
