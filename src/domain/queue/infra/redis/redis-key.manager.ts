/** 모든 key를 구하는데 필요한 속성 */
type QueuekeyParam = { concertId: number; queueUid: string };

/** 대기열 key prefix */
type WaitQueuePrefix = 'q:wait';
/** 사용열 key prefix */
type ActiveQueuePrefix = 'q:active';

/** 대기열 순서 key */
type WaitQueueSortKey =
  `${WaitQueuePrefix}:consert-${QueuekeyParam['concertId']}:sort`;
/** 대기열 정보 key */
type WaitQueueInfoKey =
  `${WaitQueuePrefix}:consert-${QueuekeyParam['concertId']}:info:${QueuekeyParam['queueUid']}`;

/** 사용열 정보 key */
type ActiveQueueInfoKey =
  `${ActiveQueuePrefix}:consert-${QueuekeyParam['concertId']}:info:${QueuekeyParam['queueUid']}`;

/** 대기열 key record */
type WaitQueueKeyRecord = {
  sort: WaitQueueSortKey;
  info: WaitQueueInfoKey;
};

export class RedisKeyManager {
  private static readonly WAIT_QUEUE_PREFIX: WaitQueuePrefix = 'q:wait';
  private static readonly ACTIVE_QUEUE_PREFIX: ActiveQueuePrefix = 'q:active';

  /**
   * 대기열 key 정보들을 담고 있는 객체를 리턴한다.
   * @param param
   * @returns
   */
  static getWaitQueueKeyRecord(param: QueuekeyParam): WaitQueueKeyRecord {
    const { concertId, queueUid } = param;
    return {
      sort: `${this.WAIT_QUEUE_PREFIX}:consert-${concertId}:sort`,
      info: `${this.WAIT_QUEUE_PREFIX}:consert-${concertId}:info:${queueUid}`,
    };
  }

  static getWaitQueueSortKey(concertId: number): WaitQueueSortKey {
    return `${this.WAIT_QUEUE_PREFIX}:consert-${concertId}:sort`;
  }

  static getWaitQueueInfoKey(param: QueuekeyParam): WaitQueueInfoKey {
    const { concertId, queueUid } = param;
    return `${this.WAIT_QUEUE_PREFIX}:consert-${concertId}:info:${queueUid}`;
  }

  static getActiveQueueInfoKey(param: QueuekeyParam): ActiveQueueInfoKey {
    const { concertId, queueUid } = param;
    return `${this.ACTIVE_QUEUE_PREFIX}:consert-${concertId}:info:${queueUid}`;
  }
}
