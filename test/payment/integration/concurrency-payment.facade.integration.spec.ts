import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { execSync } from 'child_process';
import { DataSource } from 'typeorm';

import { ScheduleModule } from '@nestjs/schedule';
import { ConflictStatusException, typeOrmDataSourceOptions } from 'src/common';
import {
  PerformanceModule,
  PerformanceService,
  SeatStatus,
} from 'src/domain/concert/performance';
import {
  PaymentFacade,
  WritePaymentCriteria,
} from 'src/domain/payment/application';
import { PaymentService } from 'src/domain/payment/doamin';
import {
  PaymentCoreRepository,
  PaymentRepository,
} from 'src/domain/payment/infra';
import { UserModule, UserService } from 'src/domain/user';
import { CustomLoggerModule } from 'src/global';

describe('PaymentFacade 동시성 통합테스트', () => {
  let paymentFacade: PaymentFacade;
  let performanceService: PerformanceService;
  let userService: UserService;
  let dataSource: DataSource;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...typeOrmDataSourceOptions,
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
  });

  beforeEach(() => {
    execSync('npm run db:drop', { stdio: 'inherit' });
    execSync('npm run db:migrate:up', { stdio: 'inherit' });
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('payment', () => {
    it('여러번 결제를 시도하는 경우 한번만 성공한다.', async () => {
      // Given
      const userId = 1;
      const reservationId = 1;
      const seatId = 1;
      const criteria = WritePaymentCriteria.from({ userId, reservationId });

      // When
      const results = await Promise.allSettled([
        paymentFacade.payment(criteria),
        paymentFacade.payment(criteria),
        paymentFacade.payment(criteria),
      ]);

      // Then
      const successCount = results.filter(
        (result) => result.status === 'fulfilled',
      ).length;
      const failCount = results.filter(
        (result) => result.status === 'rejected',
      ).length;

      expect(successCount).toBe(1);
      expect(failCount).toBe(results.length - 1);
      expect(
        results.filter((result) => result.status === 'rejected')[0].reason,
      ).toBeInstanceOf(ConflictStatusException);

      // 추가 검증: 사용자 포인트가 차감되었는지 확인
      const userPoint = await userService.getUserPoint(userId);
      expect(userPoint.amount).toBe(900_000);

      // 좌석 상태가 'BOOKED'로 변경되었는지 확인
      const seat = await performanceService.getSeat(seatId);
      expect(seat.status).toBe(SeatStatus.BOOKED);
    });
  });
});
