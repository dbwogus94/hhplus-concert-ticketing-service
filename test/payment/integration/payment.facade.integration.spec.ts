import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { execSync } from 'child_process';
import { DataSource } from 'typeorm';

import { ConflictStatusException, typeOrmDataSourceOptions } from 'src/common';
import {
  PerformanceModule,
  PerformanceService,
  SeatStatus,
} from 'src/domain/concert/performance';
import { UserModule, UserService } from 'src/domain/user';
import {
  PaymentFacade,
  WritePaymentCriteria,
} from 'src/domain/payment/application';
import { PaymentService } from 'src/domain/payment/doamin';
import {
  PaymentCoreRepository,
  PaymentRepository,
} from 'src/domain/payment/infra';
import { AuthModule } from 'src/domain/auth';

describe('PaymentFacade', () => {
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
          logging: false,
        }),
        PerformanceModule,
        UserModule,
        AuthModule,
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

  beforeEach(() => {
    execSync('npm run db:drop', { stdio: 'inherit' });
    execSync('npm run db:migrate:up', { stdio: 'inherit' });
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('payment', () => {
    it('결제가 성공적으로 이루어져야 한다', async () => {
      // Given
      const userId = 1;
      const reservationId = 1;
      const seatId = 1;
      const criteria = WritePaymentCriteria.from({ userId, reservationId });

      // When
      const result = await paymentFacade.payment(criteria);

      // Then
      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.reservationId).toBe(reservationId);

      // 추가 검증: 사용자 포인트가 차감되었는지 확인
      const userPoint = await userService.getUserPoint(userId);
      expect(userPoint.amount).toBe(0);

      // 좌석 상태가 'BOOKED'로 변경되었는지 확인
      const seat = await performanceService.getSeat(seatId);
      expect(seat.status).toBe(SeatStatus.BOOKED);
    });

    it('예약이 존재하지 않을 경우 에러가 발생해야 한다', async () => {
      // Given
      const userId = 1;
      const reservationId = -1; // 존재하지 않는 예약 ID
      const criteria = WritePaymentCriteria.from({ userId, reservationId });

      // When & Then
      await expect(paymentFacade.payment(criteria)).rejects.toThrow();
    });

    it('사용자의 포인트가 부족할 경우 에러가 발생해야 한다', async () => {
      // Given
      const userId = 1;
      const reservationId = 1;
      const criteria = WritePaymentCriteria.from({ userId, reservationId });

      // When & Then
      await expect(paymentFacade.payment(criteria)).rejects.toThrow();
    });

    it('이미 결제가 완료된 예약에 대해 중복 결제를 시도하면 에러가 발생해야 한다', async () => {
      // Given
      const userId = 1;
      const reservationId = 1;
      const criteria = WritePaymentCriteria.from({ userId, reservationId });

      // 첫 번째 결제 수행
      await paymentFacade.payment(criteria);

      // When & Then (두 번째 결제 시도)
      await expect(paymentFacade.payment(criteria)).rejects.toThrow(
        ConflictStatusException,
      );
    });
  });
});
