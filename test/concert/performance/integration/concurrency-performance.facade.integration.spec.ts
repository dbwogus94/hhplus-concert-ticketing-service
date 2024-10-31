import { ScheduleModule } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';

import { ConflictStatusException, typeOrmDataSourceOptions } from 'src/common';
import {
  ConcertEntity,
  PerformanceCoreRepository,
  PerformanceEntity,
  PerformanceFacade,
  PerformanceRepository,
  PerformanceService,
  ReservationCoreRepository,
  ReservationEntity,
  ReservationRepository,
  SeatEntity,
  WriteReservationCommand,
} from 'src/domain/concert/performance';
import { QueueModule } from 'src/domain/queue';
import { UserEntity, UserModule } from 'src/domain/user';
import {
  CustomLoggerModule,
  DistributedLockModule,
  DistributedLockProvider,
} from 'src/global';
import {
  PerformanceFactory,
  PointFactory,
  SeatFactory,
  UserFactory,
} from 'test/fixture';

describe('PerformanceFacade 동시성 통합테스트', () => {
  let performanceFacade: PerformanceFacade;
  let dataSource: DataSource;
  let manager: EntityManager;
  let lockProvider: DistributedLockProvider;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...typeOrmDataSourceOptions,
          logging: false,
        }),
        ScheduleModule.forRoot(),
        CustomLoggerModule.forRoot(),
        DistributedLockModule.forRoot(),
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
    dataSource = module.get<DataSource>(getDataSourceToken());
    manager = dataSource.manager;
    lockProvider = module.get<DistributedLockProvider>(DistributedLockProvider);
  });

  beforeEach(async () => {
    await manager.clear(PerformanceEntity);
    await manager.clear(ConcertEntity);
    await manager.clear(SeatEntity);
    await manager.clear(UserEntity);
    await manager.clear(ReservationEntity);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await lockProvider.disconnect();
  });

  describe('reserveSeat - 좌석 예약 동시성 테스트', () => {
    it('여러명의 사용자가 좌석을 동시에 예약하면 첫번째 요청한 사용자만 성공한다.', async () => {
      // Given
      const performance = PerformanceFactory.create({ id: 1 });
      const seat = SeatFactory.create({ performanceId: performance.id });
      await dataSource.manager.save(performance);
      await dataSource.manager.save(seat);

      const userIds = Array.from({ length: 20 }, (_, i) => i + 1);
      const promises = userIds.map(async (id) => {
        await manager.save(PointFactory.create({ id, amount: 100_000 }));
        await manager.save(UserFactory.create({ id, pointId: id }));
      });
      await Promise.all(promises);

      const commands = userIds.map(
        (userId) =>
          new WriteReservationCommand({
            userId,
            queueUid: '',
            performanceId: performance.id,
            seatId: seat.id,
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
    }, 10000);

    it('여러명의 사용자가 좌석을 동시에 예약하면 첫번째 사용자를 제외하고 모두 실패한다.', async () => {
      // Given
      const performance = PerformanceFactory.create({ id: 1 });
      const seat = SeatFactory.create({ performanceId: performance.id });
      await dataSource.manager.save(performance);
      await dataSource.manager.save(seat);

      const userIds = Array.from({ length: 20 }, (_, i) => i + 1);
      const promises = userIds.map(async (id) => {
        await manager.save(PointFactory.create({ id, amount: 100_000 }));
        await manager.save(UserFactory.create({ id, pointId: id }));
      });
      await Promise.all(promises);

      const commands = userIds.map(
        (userId) =>
          new WriteReservationCommand({
            userId,
            queueUid: '',
            performanceId: performance.id,
            seatId: seat.id,
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
    }, 10000);
  });
});
