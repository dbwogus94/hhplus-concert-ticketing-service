import { Injectable } from '@nestjs/common';
import {
  GetPerformancesInfo,
  GetSeatsInfo,
  PerformanceService,
  WriteReservationCommand,
} from '../domain';

@Injectable()
export class PerformanceFacade {
  constructor(private readonly performanceService: PerformanceService) {}

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
    // TODO: user 검증 로직

    const reservationId =
      await this.performanceService.reservationSeat(command);
    // TODO: wait-queue 토큰 만료 로직
    return reservationId;
  }
}
