import {
  ConcertEntity,
  PerformanceEntity,
  SeatEntity,
  SeatStatus,
} from 'src/domain/concert/performance';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedConcertPerformanceSeat1729215085622
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Concert 데이터 생성
    const concerts = [
      {
        name: '봄의 멜로디',
        description: '따뜻한 봄날을 배경으로 한 감미로운 뮤지컬 공연.',
        startDate: '2024-03-01',
        endDate: '2024-03-10',
      },
      // {
      //   name: '여름의 열정',
      //   description: '뜨거운 여름밤을 더욱 빛내줄 열정적인 뮤지컬 무대.',
      //   startDate: '2024-06-15',
      //   endDate: '2024-06-25',
      // },
    ];

    const concertEntities = await queryRunner.manager.save(
      ConcertEntity,
      concerts,
    );

    // 2. Performance 데이터 생성
    const performances = [];
    concertEntities.forEach((concert) => {
      for (let i = 0; i < 1; i++) {
        const performanceDate = new Date(concert.startDate);
        performanceDate.setDate(performanceDate.getDate() + i);
        performances.push({
          openDate: performanceDate.toISOString().split('T')[0],
          startAt: new Date(
            `${performanceDate.toISOString().split('T')[0]}T19:00:00`,
          ),
          concertId: concert.id,
        });
      }
    });

    const performanceEntities = await queryRunner.manager.save(
      PerformanceEntity,
      performances,
    );

    // 3. Seat 데이터 생성 (각 공연마다 50개의 좌석 생성)
    const seats = [];
    performanceEntities.forEach((performance) => {
      for (let i = 1; i <= 50; i++) {
        seats.push({
          position: i,
          amount: 100_000,
          status: SeatStatus.AVAILABLE,
          performanceId: performance.id,
        });
      }
    });

    await queryRunner.manager.save(SeatEntity, seats);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 데이터 삭제 (역순으로)
    await queryRunner.manager.delete(SeatEntity, {});
    await queryRunner.manager.delete(PerformanceEntity, {});
    await queryRunner.manager.delete(ConcertEntity, {});
  }
}
