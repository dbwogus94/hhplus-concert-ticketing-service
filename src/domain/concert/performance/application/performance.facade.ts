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

@Injectable()
export class PerformanceFacade {
  constructor(
    @InjectEntityManager() private readonly manager: EntityManager,
    private readonly performanceService: PerformanceService,
    private readonly userService: UserService,
    private readonly queueService: QueueService,
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

    const reservationId = await this.performanceService.reserveSeat(command)();
    // Note: 활성 토큰 만료에 실패한다고 롤백 시키지 않는다.
    await this.queueService.expireActiveQueue(command.queueUid);
    return reservationId;
  }
}
