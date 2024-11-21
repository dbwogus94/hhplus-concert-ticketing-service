import { SeatEntity, SeatStatus } from 'src/domain/concert/performance';
import { PaymentEntity } from 'src/domain/payment/doamin';
import { ReservationEntity, ReservationStatus } from 'src/domain/reservation';
import {
  PointEntity,
  PointHistoryEntity,
  PointHistoryType,
  UserEntity,
} from 'src/domain/user';
import { In, MigrationInterface, QueryRunner } from 'typeorm';

export class MockReservation1729216313520 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 유저 데이터 수정 (1~10번 유저에게 10만원 충전)
    const users = await queryRunner.manager.find(UserEntity, {
      where: { id: In([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) },
    });

    const pointIds = users.map((u) => u.pointId);
    const points = await queryRunner.manager.find(PointEntity, {
      where: { id: In(pointIds) },
    });

    for (const point of points) {
      point.amount = 1_000_000;
      await queryRunner.manager.save(PointEntity, point);

      // 포인트 충전 히스토리 생성
      const findUser = users.find((u) => u.pointId === point.id);
      await queryRunner.manager.save(PointHistoryEntity, {
        userId: findUser.id,
        amount: 100_000,
        type: PointHistoryType.CHARGE,
      });
    }

    // 2. 예약 데이터 생성
    const seats = await queryRunner.manager.find(SeatEntity, { take: 6 });
    const reservations = [];

    // Reserved 상태의 예약 (좌석 1~3)
    for (let i = 0; i < 3; i++) {
      reservations.push({
        userId: users[i].id,
        seatId: seats[i].id,
        price: seats[i].amount,
        status: ReservationStatus.REQUEST,
      });
      seats[i].status = SeatStatus.RESERVED;
    }

    // Booked 상태의 예약 (좌석 4~6)
    for (let i = 3; i < 6; i++) {
      const reservation = {
        userId: users[i].id,
        seatId: seats[i].id,
        price: seats[i].amount,
        status: ReservationStatus.CONFIRM,
      };
      reservations.push(reservation);
      seats[i].status = SeatStatus.BOOKED;

      // 포인트 사용 히스토리 생성
      await queryRunner.manager.save(PointHistoryEntity, {
        userId: users[i].id,
        amount: seats[i].amount,
        type: PointHistoryType.USE,
      });

      // 유저 포인트 차감
      points[i].amount -= seats[i].amount;
      await queryRunner.manager.save(UserEntity, points[i]);
    }

    // 예약 데이터 저장
    const insertReservations = await queryRunner.manager.save(
      ReservationEntity,
      reservations,
    );

    // 좌석 상태 업데이트
    await queryRunner.manager.save(SeatEntity, seats);

    // Payment 데이터 생성
    for (let i = 3; i < 6; i++) {
      await queryRunner.manager.save(PaymentEntity, {
        userId: users[i].id,
        payPrice: seats[i].amount,
        reservationId: insertReservations[i].id,
      });
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 데이터 삭제 (역순으로)
    await queryRunner.manager.delete(PointHistoryEntity, {});
    await queryRunner.manager.delete(PaymentEntity, {});
    await queryRunner.manager.delete(ReservationEntity, {});

    // 좌석 상태 초기화
    await queryRunner.manager.update(
      SeatEntity,
      { id: [1, 2, 3, 4, 5, 6] },
      { status: SeatStatus.AVAILABLE },
    );

    // 유저 포인트 초기화
    const users = await queryRunner.manager.find(UserEntity, {
      where: { id: In([1, 2, 3, 4, 5, 6]) },
    });

    const pointIds = users.map((u) => u.pointId);
    const points = await queryRunner.manager.find(PointEntity, {
      where: { id: In(pointIds) },
    });
    await queryRunner.manager.update(
      PointEntity,
      { id: [points] },
      { amount: 0 },
    );
  }
}
