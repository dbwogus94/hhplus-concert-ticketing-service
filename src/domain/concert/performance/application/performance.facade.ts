import { Injectable } from '@nestjs/common';

import {
  GetPerformancesInfo,
  GetSeatsInfo,
  PerformanceService,
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

  async reserveSeat(seatId: number) {
    await this.performanceService.reserveSeat(seatId);
  }

  async bookingSeat(seatId: number) {
    await this.performanceService.bookingSeat(seatId);
  }
}
