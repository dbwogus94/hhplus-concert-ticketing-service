import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { ScheduleModule } from '@nestjs/schedule';
import { ConflictStatusException, typeOrmDataSourceOptions } from 'src/common';
import {
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
import {
  PointEntity,
  UserEntity,
  UserModule,
  UserService,
} from 'src/domain/user';
import { CustomLoggerModule } from 'src/global';
import { PointFactory } from 'test/fixture/point-factory';
import { ReservationFactory } from 'test/fixture/reservation-factory';
import { SeatFactory } from 'test/fixture/seat-factory';
import { UserFactory } from 'test/fixture/user-factory';

describe('PaymentFacade 통합테스트', () => {
  let paymentFacade: PaymentFacade;
  // let paymentService: PaymentService;
  let performanceService: PerformanceService;
  let userService: UserService;
  let dataSource: DataSource;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...typeOrmDataSourceOptions,
          synchronize: true,
          dropSchema: true,
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
    // paymentService = module.get<PaymentService>(PaymentService);
    performanceService = module.get<PerformanceService>(PerformanceService);
    userService = module.get<UserService>(UserService);
    dataSource = module.get<DataSource>(getDataSourceToken());
  });

  beforeEach(async () => {
    await dataSource.manager.clear(PerformanceEntity);
    await dataSource.manager.clear(SeatEntity);
    await dataSource.manager.clear(UserEntity);
    await dataSource.manager.clear(PointEntity);
    await dataSource.manager.clear(ReservationEntity);
    await dataSource.manager.clear(PaymentEntity);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('payment', () => {
    it('결제가 성공적으로 이루어져야 한다', async () => {
      // Given
      const criteria = WritePaymentCriteria.from({
        userId: 1,
        reservationId: 1,
      });
      const seatId = 1;
      const pointId = 1;
      const amount = 100_000;
      const price = 50_000;

      await dataSource.manager.save(
        PointFactory.create({ id: pointId, amount: 100_000 }),
      );
      await dataSource.manager.save(
        UserFactory.create({ id: criteria.userId, pointId }),
      );
      await dataSource.manager.save(
        SeatFactory.createReserved({ id: seatId, amount: price }),
      );
      await dataSource.manager.save(
        ReservationFactory.create({
          id: criteria.reservationId,
          userId: criteria.userId,
          seatId,
          price,
        }),
      );

      // When
      const result = await paymentFacade.payment(criteria);

      // Then
      expect(result).toBeDefined();
      expect(result.userId).toBe(criteria.userId);
      expect(result.reservationId).toBe(criteria.reservationId);

      // 추가 검증: 사용자 포인트가 차감되었는지 확인
      const userPoint = await userService.getUserPoint(criteria.userId);
      expect(userPoint.amount).toBe(amount - price);

      // 좌석 상태가 'BOOKED'로 변경되었는지 확인
      const seat = await performanceService.getSeat(seatId);
      expect(seat.status).toBe(SeatStatus.BOOKED);
    });

    it('예약이 존재하지 않을 경우 에러가 발생해야 한다', async () => {
      // Given
      const criteria = WritePaymentCriteria.from({
        userId: 1,
        reservationId: -1,
      });
      await dataSource.manager.save(
        UserFactory.create({ id: criteria.userId }),
      );
      await dataSource.manager.save(
        ReservationFactory.create({ id: criteria.reservationId }),
      );

      // When & Then
      await expect(paymentFacade.payment(criteria)).rejects.toThrow();
    });

    it('사용자의 포인트가 부족할 경우 에러가 발생해야 한다', async () => {
      // Given
      const criteria = WritePaymentCriteria.from({
        userId: 11,
        reservationId: 1,
      });
      const pointId = 1;
      await dataSource.manager.save(
        PointFactory.create({ id: pointId, amount: 0 }),
      );
      await dataSource.manager.save(
        UserFactory.create({ id: criteria.userId, pointId }),
      );
      await dataSource.manager.save(
        ReservationFactory.create({ id: criteria.reservationId }),
      );

      // When & Then
      await expect(paymentFacade.payment(criteria)).rejects.toThrow();
    });

    it('이미 결제가 완료된 예약에 대해 중복 결제를 시도하면 에러가 발생해야 한다', async () => {
      // Given
      const criteria = WritePaymentCriteria.from({
        userId: 1,
        reservationId: 1,
      });
      const pointId = 1;
      await dataSource.manager.save(
        PointFactory.create({ id: pointId, amount: 100_000 }),
      );
      await dataSource.manager.save(
        UserFactory.create({ id: criteria.userId, pointId }),
      );
      await dataSource.manager.save(
        ReservationFactory.create({
          id: criteria.reservationId,
          userId: criteria.userId,
        }),
      );

      // 완료 예약 생성
      await dataSource.manager.save(
        ReservationFactory.createConfirm({
          id: criteria.reservationId,
          userId: criteria.userId,
        }),
      );

      // When & Then
      await expect(paymentFacade.payment(criteria)).rejects.toThrow(
        ConflictStatusException,
      );
    });
  });
});
