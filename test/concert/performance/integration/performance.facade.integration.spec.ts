import { Test, TestingModule } from '@nestjs/testing';
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
  SeatStatus,
  WriteReservationCommand,
} from 'src/domain/concert/performance';
import { UserModule } from 'src/domain/user';

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
          logging: false,
        }),
        UserModule,
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
    // performanceService = module.get<PerformanceService>(PerformanceService);
    // userService = module.get<UserService>(UserService);

    // DataSource 객체 가져오기
    dataSource = module.get<DataSource>(getDataSourceToken());
  });

  beforeEach(() => {
    // 데이터베이스 초기화 및 마이그레이션 실행
    execSync('npm run db:drop', { stdio: 'inherit' });
    execSync('npm run db:migrate:up', { stdio: 'inherit' });
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('getPerformances', () => {
    it('콘서트 Id에 해당하는 공연 리스트를 조회한다.', async () => {
      // Given
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
      const userId = 1;
      const performanceId = 1;
      const seatId = 1;

      const command = new WriteReservationCommand({
        userId,
        performanceId,
        seatId,
      });

      // When
      const reservationId = await performanceFacade.reserveSeat(command);

      // Then
      expect(reservationId).toBeDefined();
      expect(typeof reservationId).toBe('number');
    });

    it('[실패한다.] 좌석이 예약된 경우 충돌 예외가 발생한다.', async () => {
      // Given
      const userId = 1;
      const performanceId = 1;
      const seatId = 1;

      const command = new WriteReservationCommand({
        userId,
        performanceId,
        seatId,
      });

      // Reserve the seat first time
      await performanceFacade.reserveSeat(command);

      // When & Then
      await expect(performanceFacade.reserveSeat(command)).rejects.toThrow(
        ConflictStatusException,
      );
    });
  });
});
