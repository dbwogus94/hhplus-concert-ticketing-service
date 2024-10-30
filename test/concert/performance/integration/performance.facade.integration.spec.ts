import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { ScheduleModule } from '@nestjs/schedule';
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
  SeatStatus,
  WriteReservationCommand,
} from 'src/domain/concert/performance';
import { QueueModule } from 'src/domain/queue';
import { UserEntity, UserModule } from 'src/domain/user';
import { CustomLoggerModule } from 'src/global';
import { ConcertFactory } from 'test/fixture/concert-factory';
import { PerformanceFactory } from 'test/fixture/performance-factory';
import { SeatFactory } from 'test/fixture/seat-factory';
import { UserFactory } from 'test/fixture/user-factory';
import { ReservationFactory } from 'test/fixture/reservation-factory';

describe('PerformanceFacade 통합테스트', () => {
  let performanceFacade: PerformanceFacade;
  // let performanceService: PerformanceService;
  // let userService: UserService;
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
    await dataSource.manager.clear(PerformanceEntity);
    await dataSource.manager.clear(ConcertEntity);
    await dataSource.manager.clear(ReservationEntity);
    await dataSource.manager.clear(SeatEntity);
    await dataSource.manager.clear(UserEntity);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('getPerformances', () => {
    it('콘서트 Id에 해당하는 공연 리스트를 조회한다.', async () => {
      // Given
      await dataSource.manager.save(ConcertFactory.create({ id: 1 }));
      await dataSource.manager.save(
        PerformanceFactory.create({ concertId: 1 }),
      );
      const concertId = 1;

      // When
      const performances = await performanceFacade.getPerformances(concertId);

      // Then
      expect(performances).toBeDefined();
      expect(performances.length).toBeGreaterThan(0);
      expect(performances[0].concertId).toBe(concertId);
    });
  });

  describe('getAvailableSeats', () => {
    it('공연 Id에 해당하는 예약가능한 좌석 리스트를 조회한다.', async () => {
      // Given
      await dataSource.manager.save(PerformanceFactory.create({ id: 1 }));
      await dataSource.manager.save(
        SeatFactory.create({ performanceId: 1, id: 12 }),
      );
      const performanceId = 1;

      // When
      const seats = await performanceFacade.getAvailableSeats(performanceId);

      // Then
      expect(seats).toBeDefined();
      expect(seats.length).toBeGreaterThan(0);
      expect(seats[0].status).toBe(SeatStatus.AVAILABLE);
    });
  });

  describe('reserveSeat', () => {
    it('선택한 좌석을 예약한다.', async () => {
      // Given
      await dataSource.manager.save(UserFactory.create({ id: 11 }));
      await dataSource.manager.save(PerformanceFactory.create({ id: 1 }));
      await dataSource.manager.save(
        SeatFactory.create({ performanceId: 1, id: 12 }),
      );
      const userId = 11;
      const performanceId = 1;
      const seatId = 12;

      const command = new WriteReservationCommand({
        userId,
        queueUid: '',
        performanceId,
        seatId,
      });

      // When
      const reservationId = await performanceFacade.reserveSeat(command);

      // Then
      expect(reservationId).toBeDefined();
      expect(typeof reservationId).toBe('number');
    });

    it('좌석이 예약된 경우 충돌 예외가 발생한다.', async () => {
      // Given
      await dataSource.manager.save(UserFactory.create({ id: 1 }));
      await dataSource.manager.save(PerformanceFactory.create({ id: 1 }));
      await dataSource.manager.save(SeatFactory.createBooked({ id: 1 }));

      const userId = 1;
      const performanceId = 1;
      const seatId = 1;

      const command = new WriteReservationCommand({
        userId,
        queueUid: '',
        performanceId,
        seatId,
      });

      // When & Then
      await expect(performanceFacade.reserveSeat(command)).rejects.toThrow(
        ConflictStatusException,
      );
    });

    it('좌석을 중복 예약하는 경우 충돌 예외가 발생한다.', async () => {
      // Given
      const command = new WriteReservationCommand({
        userId: 1,
        queueUid: '',
        performanceId: 11,
        seatId: 1,
      });

      await dataSource.manager.save(UserFactory.create({ id: command.userId }));
      await dataSource.manager.save(
        PerformanceFactory.create({ id: command.performanceId }),
      );
      await dataSource.manager.save(
        SeatFactory.createBooked({
          performanceId: command.performanceId,
          id: command.seatId,
        }),
      );
      await dataSource.manager.save(
        ReservationFactory.createConfirm({
          userId: command.userId,
          seatId: command.seatId,
        }),
      );

      // When & Then
      await expect(performanceFacade.reserveSeat(command)).rejects.toThrow(
        ConflictStatusException,
      );
    });
  });
});
