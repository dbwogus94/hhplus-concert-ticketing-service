import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';

import { ConflictStatusException } from 'src/common';
import { PerformanceEntity, SeatEntity } from 'src/domain/concert/performance';
import {
  PaymentFacade,
  WritePaymentCriteria,
} from 'src/domain/payment/application';
import { PaymentEntity } from 'src/domain/payment/doamin';
import { ReservationEntity } from 'src/domain/reservation';
import { PointEntity, UserEntity, UserService } from 'src/domain/user';
import {
  PointFactory,
  ReservationFactory,
  SeatFactory,
  UserFactory,
} from 'test/fixture';
import { getTestingModule } from 'test/pre-setup';

describe('PaymentFacade 통합테스트', () => {
  let dataSource: DataSource;
  let manager: EntityManager;

  let paymentFacade: PaymentFacade;
  let userService: UserService;

  beforeAll(async () => {
    const module = getTestingModule();

    paymentFacade = module.get<PaymentFacade>(PaymentFacade);
    userService = module.get<UserService>(UserService);
    dataSource = module.get<DataSource>(getDataSourceToken());
    manager = dataSource.manager;
  });

  beforeEach(async () => {
    await manager.clear(PerformanceEntity);
    await manager.clear(SeatEntity);
    await manager.clear(UserEntity);
    await manager.clear(PointEntity);
    await manager.clear(ReservationEntity);
    await manager.clear(PaymentEntity);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('payment', () => {
    describe('성공한다.', () => {
      it('결제가 성공적으로 이루어져야 한다', async () => {
        // Given
        const point = PointFactory.create({ id: 1, amount: 100_000 });
        const user = UserFactory.create({ id: 1, pointId: point.id });
        const seat = SeatFactory.createReserved({ id: 1, amount: 50_000 });
        const reservation = ReservationFactory.create({
          id: 1,
          userId: user.id,
          seatId: seat.id,
          price: seat.amount,
        });
        await manager.save(point);
        await manager.save(user);
        await manager.save(seat);
        await manager.save(reservation);

        const criteria = WritePaymentCriteria.from({
          userId: user.id,
          reservationId: reservation.id,
        });

        // When
        const result = await paymentFacade.payment(criteria);

        // Then
        expect(result).toBeDefined();
        expect(result.userId).toBe(criteria.userId);
        expect(result.reservationId).toBe(criteria.reservationId);

        // 추가 검증: 사용자 포인트가 차감되었는지 확인
        const userPoint = await userService.getUserPoint(criteria.userId);
        expect(userPoint.amount).toBe(point.amount - reservation.price);

        // 좌석 상태가 'BOOKED'로 변경되었는지 확인 => 이벤트 분리
        // const foundSeat = await performanceService.getSeat(seat.id);
        // expect(foundSeat.status).toBe(SeatStatus.BOOKED);
      });
    });

    describe('실패한다.', () => {
      it('예약이 존재하지 않을 경우 에러가 발생해야 한다', async () => {
        // Given
        const user = UserFactory.create({ id: 1 });
        await manager.save(user);

        const criteria = WritePaymentCriteria.from({
          userId: user.id,
          reservationId: -1,
        });

        // When & Then
        await expect(paymentFacade.payment(criteria)).rejects.toThrow();
      });

      it('예약이 "예약신청" 상태가 아니라면 에러가 발생해야 한다', async () => {
        // Given
        const user = UserFactory.create({ id: 1 });
        const reservation = ReservationFactory.createConfirm({ id: 1 });
        await manager.save(user);
        await manager.save(reservation);

        const criteria = WritePaymentCriteria.from({
          userId: user.id,
          reservationId: reservation.id,
        });

        // When & Then
        await expect(paymentFacade.payment(criteria)).rejects.toThrow();
      });

      it('사용자의 포인트가 부족할 경우 에러가 발생해야 한다', async () => {
        // Given
        const point = PointFactory.create({ id: 1, amount: 0 });
        const user = UserFactory.create({ id: 1, pointId: point.id });
        const reservation = ReservationFactory.create({ id: 1 });
        await manager.save(point);
        await manager.save(user);
        await manager.save(reservation);

        const criteria = WritePaymentCriteria.from({
          userId: user.id,
          reservationId: reservation.id,
        });

        // When & Then
        await expect(paymentFacade.payment(criteria)).rejects.toThrow();
      });

      it('이미 결제가 완료된 예약에 대해 중복 결제를 시도하면 에러가 발생해야 한다', async () => {
        // Given
        const point = PointFactory.create({ id: 1, amount: 100_000 });
        const user = UserFactory.create({ id: 1, pointId: point.id });
        const reservation = ReservationFactory.create({
          id: 1,
          userId: user.id,
        });
        await manager.save(reservation);

        // 완료 예약 생성
        const reservationConfirm = reservation.confirm();
        await manager.save(reservationConfirm);

        const criteria = WritePaymentCriteria.from({
          userId: user.id,
          reservationId: reservation.id,
        });

        // When & Then
        await expect(paymentFacade.payment(criteria)).rejects.toThrow(
          ConflictStatusException,
        );
      });
    });
  });
});
