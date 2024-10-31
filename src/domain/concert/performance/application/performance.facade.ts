import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import {
  GetPerformancesInfo,
  GetSeatsInfo,
  PerformanceService,
  WriteReservationCommand,
} from '../domain';
import { UserService } from 'src/domain/user';
import { QueueService } from 'src/domain/queue';
import { DistributedLockProvider } from 'src/global/distributed-lock/distributed-lock-provider';

@Injectable()
export class PerformanceFacade {
  constructor(
    @InjectEntityManager() private readonly manager: EntityManager,
    private readonly performanceService: PerformanceService,
    private readonly userService: UserService,
    private readonly queueService: QueueService,
    private readonly lockProvider: DistributedLockProvider,
  ) {}

  async getPerformances(concertId: number): Promise<GetPerformancesInfo[]> {
    const performances =
      await this.performanceService.getPerformances(concertId);
    return performances;
  }

  async getAvailableSeats(performanceId: number): Promise<GetSeatsInfo[]> {
    const seats =
      await this.performanceService.getAvailableSeats(performanceId);
    return seats;
  }

  async reserveSeat(command: WriteReservationCommand) {
    await this.userService.getUser(command.userId);

    return await this.lockProvider.withMutex('reserveSeat', async () => {
      return await this.manager.transaction(async (txManager) => {
        const reservationId =
          this.performanceService.reserveSeat(command)(txManager);

        await this.queueService.expireQueue(command.queueUid)(txManager);
        return reservationId;
      });
    });
  }
}
