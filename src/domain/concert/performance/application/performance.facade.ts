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
  async getSeats(performanceId: number): Promise<GetSeatsInfo[]> {
    const seats =
      await this.performanceService.getAvailableSeats(performanceId);
    return seats;
  }

  async reservationSeat(command: WriteReservationCommand): Promise<number> {
    // TODO: user 서비스 개발하고 검증 넣어야 함

    const reservationId =
      await this.performanceService.reservationSeat(command);
    return reservationId;
  }
}
