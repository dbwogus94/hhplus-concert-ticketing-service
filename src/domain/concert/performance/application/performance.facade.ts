import { Injectable } from '@nestjs/common';
import {
  GetPerformancesInfo,
  GetSeatsInfo,
  PerformanceService,
  WriteReservationCommand,
} from '../domain';
import { UserService } from 'src/domain/user';

@Injectable()
export class PerformanceFacade {
  constructor(
    private readonly performanceService: PerformanceService,
    private readonly userService: UserService,
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

  async reservationSeat(command: WriteReservationCommand): Promise<number> {
    await this.userService.getUserPoint(command.userId);

    // 객체 지향적으로 UserInfo를 넣게 하자
    const reservationId =
      await this.performanceService.reservationSeat(command);
    // TODO: wait-queue 토큰 만료 로직
    return reservationId;
  }
}
