import { faker } from '@faker-js/faker';
import {
  PerformanceEntity,
  SeatEntity,
  SeatStatus,
} from 'src/domain/concert/performance';
import { PointEntity, UserEntity } from 'src/domain/user';

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

  static generateUser(param: { id: number; pointId: number }) {
    const user = new UserEntity();

    user.id = param.id;
    user.createdAt = new Date();
    user.updatedAt = new Date();
    user.pointId = param.pointId;
    user.name = faker.person.fullName();
    user.email = faker.internet.email({
      firstName: user.name,
    });

    return user;
  }

  static generatePoint(param: { id: number; amount?: number }) {
    const point = new PointEntity();
    point.id = param.id;
    point.createdAt = new Date();
    point.updatedAt = new Date();
    point.amount = param.amount ?? 0;
    return point;
  }
}
