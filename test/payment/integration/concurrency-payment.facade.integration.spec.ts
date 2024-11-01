import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';

import { ScheduleModule } from '@nestjs/schedule';
import { typeOrmDataSourceOptions } from 'src/common';
import {
  ConcertEntity,
  PerformanceEntity,
  PerformanceModule,
  PerformanceService,
  ReservationEntity,
  SeatEntity,
  SeatStatus,
} from 'src/domain/concert/performance';
import {
  PaymentFacade,
  WritePaymentCriteria,
} from 'src/domain/payment/application';
import { PaymentEntity, PaymentService } from 'src/domain/payment/doamin';
import {
  PaymentCoreRepository,
  PaymentRepository,
} from 'src/domain/payment/infra';
import { UserEntity, UserModule, UserService } from 'src/domain/user';
import { CustomLoggerModule } from 'src/global';
import {
  PointFactory,
  ReservationFactory,
  SeatFactory,
  UserFactory,
} from 'test/fixture';

describe('PaymentFacade 동시성 통합테스트', () => {
  let dataSource: DataSource;
  let manager: EntityManager;
  let paymentFacade: PaymentFacade;

  let performanceService: PerformanceService;
  let userService: UserService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...typeOrmDataSourceOptions,
          synchronize: true,
          logging: false,
        }),
        ScheduleModule.forRoot(),
        CustomLoggerModule.forRoot(),
        PerformanceModule,
        UserModule,
      ],
      providers: [
        PaymentFacade,
        PaymentService,
        { provide: PaymentRepository, useClass: PaymentCoreRepository },
      ],
    }).compile();

    paymentFacade = module.get<PaymentFacade>(PaymentFacade);
    performanceService = module.get<PerformanceService>(PerformanceService);
    userService = module.get<UserService>(UserService);

    dataSource = module.get<DataSource>(getDataSourceToken());
    manager = dataSource.manager;
  });

  beforeEach(async () => {
    await manager.clear(PerformanceEntity);
    await manager.clear(ConcertEntity);
    await manager.clear(SeatEntity);
    await manager.clear(UserEntity);
    await manager.clear(ReservationEntity);
    await manager.clear(PaymentEntity);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('payment', () => {
    it('1000번 결제를 시도하는 경우 한 번만 성공한다.', async () => {
      // Given
      const point = PointFactory.create({ id: 1, amount: 10_000_000 });
      const user = UserFactory.create({ id: 1, pointId: point.id });
      const seat = SeatFactory.createReserved({ id: 1, amount: 1 });
      const reservation = ReservationFactory.create({
        id: 1,
        userId: user.id,
        seatId: seat.id,
        price: seat.amount,
      });
      await dataSource.manager.save(point);
      await dataSource.manager.save(user);
      await dataSource.manager.save(seat);
      await dataSource.manager.save(reservation);

      const length = 1000;
      const criteria = WritePaymentCriteria.from({
        userId: user.id,
        reservationId: reservation.id,
      });
      const criterias = Array.from({ length }, () => criteria);

      // When
      const results = await Promise.allSettled(
        criterias.map((criteria) => paymentFacade.payment(criteria)),
      );

      // Then
      const successCount = results.filter(
        (result) => result.status === 'fulfilled',
      ).length;
      const failCount = results.filter(
        (result) => result.status === 'rejected',
      ).length;

      expect(successCount).toBe(1);
      expect(failCount).toBe(results.length - 1);

      // 추가 검증: 사용자 포인트가 차감되었는지 확인
      const userPoint = await userService.getUserPoint(criteria.userId);
      expect(userPoint.amount).toBe(point.amount - seat.amount);

      // 좌석 상태가 'BOOKED'로 변경되었는지 확인
      const findSeat = await performanceService.getSeat(seat.id);
      expect(findSeat.status).toBe(SeatStatus.BOOKED);
    }, 100000);
  });
});
