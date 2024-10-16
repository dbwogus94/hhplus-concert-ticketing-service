import { faker } from '@faker-js/faker';
import {
  PerformanceEntity,
  SeatEntity,
  SeatStatus,
} from 'src/domain/concert/performance';

export class MockEntityGenerator {
  static generatePerformance(id: number, concertId: number): PerformanceEntity {
    const performance = new PerformanceEntity();
    performance.id = id;
    performance.createdAt = new Date();
    performance.updatedAt = new Date();
    performance.openDate = faker.date.future().toISOString().split('T')[0];
    performance.startAt = faker.date.future();
    performance.concertId = concertId;
    return performance;
  }

  static generateSeat(id: number, performanceId: number) {
    const seat = new SeatEntity();
    const randomPosition = () => faker.number.int({ min: 1, max: 50 });

    seat.id = id;
    seat.createdAt = new Date();
    seat.updatedAt = new Date();
    seat.position = randomPosition();
    seat.amount = 50_000;
    seat.status = SeatStatus.AVAILABLE;
    seat.performanceId = performanceId;
    return seat;
  }
}
