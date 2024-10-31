import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';

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
import {
  ConcertFactory,
  PerformanceFactory,
  ReservationFactory,
  SeatFactory,
  UserFactory,
} from 'test/fixture';

describe('PerformanceFacade 통합테스트', () => {
  let dataSource: DataSource;
  let manager: EntityManager;

  let performanceFacade: PerformanceFacade;

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
  });

  beforeEach(async () => {
    await manager.clear(PerformanceEntity);
    await manager.clear(ConcertEntity);
    await manager.clear(ReservationEntity);
    await manager.clear(SeatEntity);
    await manager.clear(UserEntity);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('getPerformances', () => {
    it('콘서트 Id에 해당하는 공연 리스트를 조회한다.', async () => {
      // Given
      const concert = ConcertFactory.create({ id: 1 });
      const performance = PerformanceFactory.create({ concertId: concert.id });
      await manager.save(concert);
      await manager.save(performance);

      // When
      const performances = await performanceFacade.getPerformances(concert.id);

      // Then
      expect(performances).toBeDefined();
      expect(performances.length).toBeGreaterThan(0);
      expect(performances[0].concertId).toBe(concert.id);
    });
  });

  describe('getAvailableSeats', () => {
    it('공연 Id에 해당하는 예약가능한 좌석 리스트를 조회한다.', async () => {
      // Given
      const performance = PerformanceFactory.create({ concertId: 1 });
      const seat = SeatFactory.create({ performanceId: performance.id });
      await manager.save(performance);
      await manager.save(seat);

      // When
      const seats = await performanceFacade.getAvailableSeats(performance.id);

      // Then
      expect(seats).toBeDefined();
      expect(seats.length).toBeGreaterThan(0);
      expect(seats[0].status).toBe(SeatStatus.AVAILABLE);
    });
  });

  describe('reserveSeat', () => {
    it('선택한 좌석을 예약한다.', async () => {
      // Given
      const user = UserFactory.create({ id: 11 });
      const performance = PerformanceFactory.create({ id: 1 });
      const seat = SeatFactory.create({ performanceId: performance.id });

      await manager.save(user);
      await manager.save(performance);
      await manager.save(seat);

      const command = new WriteReservationCommand({
        userId: user.id,
        queueUid: '',
        performanceId: performance.id,
        seatId: seat.id,
      });

      // When
      const reservationId = await performanceFacade.reserveSeat(command);

      // Then
      expect(reservationId).toBeDefined();
      expect(typeof reservationId).toBe('number');
    });

    it('좌석이 예약된 경우 충돌 예외가 발생한다.', async () => {
      // Given
      const user = UserFactory.create({ id: 11 });
      const performance = PerformanceFactory.create({ id: 1 });
      const seat = SeatFactory.createBooked({ performanceId: performance.id });
      await manager.save(user);
      await manager.save(performance);
      await manager.save(seat);

      const command = new WriteReservationCommand({
        userId: user.id,
        queueUid: '',
        performanceId: performance.id,
        seatId: seat.id,
      });

      // When & Then
      await expect(performanceFacade.reserveSeat(command)).rejects.toThrow(
        ConflictStatusException,
      );
    });

    it('좌석을 중복 예약하는 경우 충돌 예외가 발생한다.', async () => {
      // Given
      const user = UserFactory.create({ id: 11 });
      const performance = PerformanceFactory.create({ id: 1 });
      const seat = SeatFactory.createBooked({ performanceId: performance.id });
      const reservation = ReservationFactory.createConfirm({
        userId: user.id,
        seatId: seat.id,
      });
      await manager.save(user);
      await manager.save(performance);
      await manager.save(seat);
      await manager.save(reservation);

      const command = new WriteReservationCommand({
        userId: user.id,
        queueUid: '',
        performanceId: performance.id,
        seatId: seat.id,
      });

      // When & Then
      await expect(performanceFacade.reserveSeat(command)).rejects.toThrow(
        ConflictStatusException,
      );
    });
  });
});
