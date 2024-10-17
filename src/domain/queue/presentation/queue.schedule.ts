import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';

import { QueueFacade } from '../application';

@Injectable()
export class QueueSchedule implements OnApplicationBootstrap {
  /** 1분 마다 실행 */
  static readonly CON_TIME = '0 */1 * * * *';
  static readonly JOB = {
    CHANGE_QUEUE_ACTIVE_STATUS: 'ChangeQueueActiveStatus',
    CHANGE_QUEUE_EXPIRE_STATUS: 'ChangeQueueExpireStatus',
  };

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly queueFacade: QueueFacade,
  ) {}

  async onApplicationBootstrap() {
    console.log('( onApplicationBootstrap ) ');

    try {
    } catch (error) {
      console.error(error as Error);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    name: QueueSchedule.JOB.CHANGE_QUEUE_ACTIVE_STATUS,
  })
  async changeQueueActiveStatus() {
    console.warn(`[${QueueSchedule.JOB.CHANGE_QUEUE_ACTIVE_STATUS}] start`);

    const job = this.schedulerRegistry.getCronJob(
      QueueSchedule.JOB.CHANGE_QUEUE_ACTIVE_STATUS,
    );
    job.stop();

    try {
      const activeCount = 100; // TODO: 환경변수나 API로 조정 가능하게 변경하자
      await this.queueFacade.changeQueueActiveStatus(activeCount);
    } catch (error) {
      console.error(error);
    }
    console.warn(`[${QueueSchedule.JOB.CHANGE_QUEUE_ACTIVE_STATUS}] end`);

    job.start();
  }

  // @Cron(QueueSchedule.CON_TIME, {
  //   name: QueueSchedule.JOB.CHANGE_QUEUE_EXPIRE_STATUS,
  // })
  // TODO: 서비스 제한시간이 자닌 토큰 만료 처리
  async changeQueueExpireStatus() {
    console.warn(`[${QueueSchedule.JOB.CHANGE_QUEUE_EXPIRE_STATUS}] start`);

    const job = this.schedulerRegistry.getCronJob(
      QueueSchedule.JOB.CHANGE_QUEUE_EXPIRE_STATUS,
    );
    job.stop();

    try {
      await this.queueFacade.changeQueueExpireStatus();
    } catch (error) {
      console.error(error);
    }
    console.warn(`[${QueueSchedule.JOB.CHANGE_QUEUE_EXPIRE_STATUS}] end`);

    job.start();
  }
}
