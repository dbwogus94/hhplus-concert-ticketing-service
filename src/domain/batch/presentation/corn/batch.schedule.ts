import { Controller, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';

import { ApiExcludeController } from '@nestjs/swagger';
import { CustomLoggerService } from 'src/global';
import { BatchFacade } from '../../application';

@ApiExcludeController()
@Controller()
export class BatchSchedule implements OnApplicationBootstrap {
  /** 1분 마다 실행 */
  static readonly CON_TIME = '0 */1 * * * *';
  static readonly JOB = {
    RESERVATION_OUTBOX: 'ReservationOutbox',
    PAYMENT_OUTBOX: 'PaymentOutbox',
  };

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly logger: CustomLoggerService,
    private readonly facade: BatchFacade,
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

  @Cron(CronExpression.EVERY_5_SECONDS, {
    name: BatchSchedule.JOB.RESERVATION_OUTBOX,
  })
  async reProducingReservationOutBox() {
    this.logger.debug(`[${BatchSchedule.JOB.RESERVATION_OUTBOX}] start`);

    const job = this.schedulerRegistry.getCronJob(
      BatchSchedule.JOB.RESERVATION_OUTBOX,
    );
    job.stop();

    try {
      await this.facade.reProducingReservationOutBox();
    } catch (error) {
      this.logger.error(error as Error);
    }
    this.logger.debug(`[${BatchSchedule.JOB.RESERVATION_OUTBOX}] end`);
    job.start();
  }

  @Cron(CronExpression.EVERY_5_SECONDS, {
    name: BatchSchedule.JOB.PAYMENT_OUTBOX,
  })
  async reProducingPaymentOutBox() {
    this.logger.debug(`[${BatchSchedule.JOB.PAYMENT_OUTBOX}] start`);

    const job = this.schedulerRegistry.getCronJob(
      BatchSchedule.JOB.PAYMENT_OUTBOX,
    );
    job.stop();

    try {
      await this.facade.reProducingPaymentOutBox();
    } catch (error) {
      this.logger.error(error as Error);
    }
    this.logger.debug(`[${BatchSchedule.JOB.RESERVATION_OUTBOX}] end`);
    job.start();
  }
}
