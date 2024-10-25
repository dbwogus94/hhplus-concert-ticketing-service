import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleModule } from '@nestjs/schedule';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { execSync } from 'child_process';
import { DataSource } from 'typeorm';

import { ConflictStatusException, typeOrmDataSourceOptions } from 'src/common';
import {
  PerformanceCoreRepository,
  PerformanceFacade,
  PerformanceRepository,
  PerformanceService,
  ReservationCoreRepository,
  ReservationRepository,
  WriteReservationCommand,
} from 'src/domain/concert/performance';
import { QueueModule } from 'src/domain/queue';
import { UserModule } from 'src/domain/user';
import { CustomLoggerModule } from 'src/global';

describe('PerformanceFacade 통합테스트', () => {
  let performanceFacade: PerformanceFacade;

  let dataSource: DataSource;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...typeOrmDataSourceOptions,
          logging: true,
        }),
        ScheduleModule.forRoot(),
        CustomLoggerModule.forRoot(),
        UserModule,
        QueueModule,
      ],
      providers: [
        PerformanceFacade,
        PerformanceService,
        {
          provide: PerformanceRepository,
          useClass: PerformanceCoreRepository,
        },
        {
          provide: ReservationRepository,
          useClass: ReservationCoreRepository,
        },
      ],
    }).compile();

    performanceFacade = module.get<PerformanceFacade>(PerformanceFacade);

    // DataSource 객체 가져오기
    dataSource = module.get<DataSource>(getDataSourceToken());
  });

  beforeEach(async () => {
    // 데이터베이스 초기화 및 마이그레이션 실행
    execSync('npm run db:drop', { stdio: 'inherit' });
    execSync('npm run db:migrate:up', { stdio: 'inherit' });
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('reserveSeat - 좌석 예약 동시성 테스트', () => {
    it('여러명의 사용자가 좌석을 동시에 예약하면 첫번째 요청한 사용자만 성공한다.', async () => {
      // Given
      const performanceId = 1;
      const seatId = 11;
      const userIds = [11, 12, 13, 14, 15, 16, 17];

      const commands = userIds.map(
        (userId) =>
          new WriteReservationCommand({
            userId,
            queueUid: '',
            performanceId,
            seatId,
          }),
      );

      // When
      const results = await Promise.allSettled(
        commands.map((command) => performanceFacade.reserveSeat(command)),
      );

      // Then
      const successCount = results.filter(
        (result) => result.status === 'fulfilled',
      ).length;
      const failCount = results.filter(
        (result) => result.status === 'rejected',
      ).length;

      expect(successCount).toBe(1);
      expect(failCount).toBe(userIds.length - 1);
    });

    it('여러명의 사용자가 좌석을 동시에 예약하면 첫번째 사용자를 제외하고 모두 실패한다.', async () => {
      // Given
      const performanceId = 1;
      const seatId = 11;
      const userIds = [11, 12, 13, 14, 15, 16, 17];

      const commands = userIds.map(
        (userId) =>
          new WriteReservationCommand({
            userId,
            queueUid: '',
            performanceId,
            seatId,
          }),
      );

      // When
      const results = await Promise.allSettled(
        commands.map((command) => performanceFacade.reserveSeat(command)),
      );

      // Then
      const successCount = results.filter(
        (result) => result.status === 'fulfilled',
      ).length;
      const failCount = results.filter(
        (result) => result.status === 'rejected',
      ).length;

      expect(successCount).toBe(1);
      expect(failCount).toBe(userIds.length - 1);
      expect(
        results.filter((result) => result.status === 'rejected')[0].reason,
      ).toBeInstanceOf(ConflictStatusException);
    });

    it('한명의 사용자가 좌석을 중복 예약하는 경우 한번만 성공한다.', async () => {
      // Given
      const userId = 11;
      const performanceId = 1;
      const seatId = 11;

      const command = new WriteReservationCommand({
        userId,
        queueUid: '',
        performanceId,
        seatId,
      });

      // When
      const results = await Promise.allSettled([
        performanceFacade.reserveSeat(command),
        performanceFacade.reserveSeat(command),
        performanceFacade.reserveSeat(command),
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

      // 실제로 DB에 하나의 예약만 생성되었는지 확인
      const reservations = await dataSource
        .getRepository('reservation')
        .find({ where: { userId, seatId } });
      expect(reservations.length).toBe(1);
    });
  });
});
