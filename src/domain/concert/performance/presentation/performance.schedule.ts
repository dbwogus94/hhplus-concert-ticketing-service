import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { PerformanceFacade } from '../application';
import { CustomLoggerService } from 'src/global';

@Injectable()
export class PerformanceSchedule implements OnApplicationBootstrap {
  /** 5분 마다 실행 */
  static readonly CON_TIME = '0 */1 * * * *';
  static readonly JOB = {
    CHANGE_PERFORMANCE_SEAT_RESERVED: 'ChangePerformanceSeatReserved',
  };

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly logger: CustomLoggerService,
    private readonly performanceFacade: PerformanceFacade,
  ) {
    this.logger.setTarget(this.constructor.name);
  }

  async onApplicationBootstrap() {
    this.logger.log('( onApplicationBootstrap ) ');

    try {
    } catch (error) {
      this.logger.error(error as Error);
    }
  }

  @Cron(PerformanceSchedule.CON_TIME, {
    name: PerformanceSchedule.JOB.CHANGE_PERFORMANCE_SEAT_RESERVED,
  })
  async queueChangeActiveStatus() {
    this.logger.warn(
      `[${PerformanceSchedule.JOB.CHANGE_PERFORMANCE_SEAT_RESERVED}] start`,
    );

    const job = this.schedulerRegistry.getCronJob(
      PerformanceSchedule.JOB.CHANGE_PERFORMANCE_SEAT_RESERVED,
    );
    job.stop();

    try {
    } catch (error) {
      this.logger.error(error as Error);
    }
    this.logger.warn(
      `[${PerformanceSchedule.JOB.CHANGE_PERFORMANCE_SEAT_RESERVED}] end`,
    );

    job.start();
  }
}
