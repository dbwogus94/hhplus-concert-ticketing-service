import { faker } from '@faker-js/faker';
import { type MockProxy, mock } from 'jest-mock-extended';
import { ConflictStatusException, ResourceNotFoundException } from 'src/common';

import {
  GetPerformancesInfo,
  GetSeatsInfo,
  PerformanceEntity,
  PerformanceRepository,
  PerformanceService,
  ReservationRepository,
  SeatEntity,
  SeatStatus,
  WriteReservationCommand,
} from 'src/domain/concert/performance';
import { DataSource } from 'typeorm';

describe('PerformanceService', () => {
  let mockDataSource: MockProxy<DataSource>;
  let performanceRepo: MockProxy<PerformanceRepository>;
  let reservationRepo: MockProxy<ReservationRepository>;
  let service: PerformanceService;

  beforeEach(() => {
    mockDataSource = mock<DataSource>();
    performanceRepo = mock<PerformanceRepository>();
    reservationRepo = mock<ReservationRepository>();
    service = new PerformanceService(
      mockDataSource,
      performanceRepo,
      reservationRepo,
    );
  });

  describe('getPerformances', () => {
    describe('성공한다.', () => {
      it('콘서트 ID가 없거나 콘서트 ID에 해당하는 공연이 없으면 빈배열을 리턴한다.', async () => {
        // give
        const concertId = 10;
        const success = 0;

        performanceRepo.getPerformancesBy.mockResolvedValue([]);

        // when
        const results = await service.getPerformances(concertId);

        // then
        expect(results.length).toBe(success);
      });

      it('콘서트 ID를 가진 공연 리스트를 응답한다.', async () => {
        // give
        const concertId = 10;
        const performanceEntities = Array.from({ length: 10 }, (_, i) =>
          createRandomPerformance(i + 1, concertId),
        );
        const success = GetPerformancesInfo.of(performanceEntities);

        performanceRepo.getPerformancesBy.mockResolvedValue(
          performanceEntities,
        );

        // when
        const results = await service.getPerformances(concertId);

        // then
        expect(results.length).toBe(success.length);
        expect(results).toEqual(success);
      });
    });
  });

  describe('getSeats', () => {
    describe('성공한다.', () => {
      it('공연 ID가 없거나 공연 ID에 해당하는 좌석이 없으면 빈배열을 리턴한다.', async () => {
        // give
        const performanceId = 10;
        const success = 0;

        // mock
        performanceRepo.getSeatsBy.mockResolvedValue([]);

        // when
        const results = await service.getSeats(performanceId);

        // then
        expect(results.length).toBe(success);
      });

      it('공연 ID를 가진 좌석 리스트를 응답한다.', async () => {
        // give
        const performanceId = 10;
        const seatEntities = Array.from({ length: 50 }, (_, i) =>
          createRandomSeat(i + 1, performanceId),
        );
        const success = GetSeatsInfo.of(seatEntities);

        // mock
        performanceRepo.getSeatsBy.mockResolvedValue(seatEntities);

        // when
        const results = await service.getSeats(performanceId);

        // then
        expect(results.length).toBe(success.length);
        expect(results).toEqual(success);
      });
    });
  });

  describe('reservationSeat', () => {
    describe('실패한다.', () => {
      it('예약하려는 좌석이 존재하지 않으면 실패한다.', () => {
        // given
        const command = WriteReservationCommand.from({
          userId: 1,
          performanceId: 10,
          seatId: 100,
        });
        const success = ResourceNotFoundException;

        // mock
        performanceRepo.getSeatBy.mockRejectedValue(
          new ResourceNotFoundException(),
        );

        // when
        const promiseResult = service.reservationSeat(command);
        // then
        expect(promiseResult).rejects.toBeInstanceOf(success);
      });

      it('예약하려는 좌석이 "임시예약" 상태면 실패한다.', () => {
        // given
        const command = WriteReservationCommand.from({
          userId: 1,
          performanceId: 10,
          seatId: 15,
        });
        const seatEntity = createRandomSeat(
          command.seatId,
          command.performanceId,
        );
        seatEntity.status = SeatStatus.RESERVED;
        const success = ConflictStatusException;

        // mock
        performanceRepo.getSeatBy.mockResolvedValue(seatEntity);

        // when
        const promiseResult = service.reservationSeat(command);
        // then
        expect(promiseResult).rejects.toBeInstanceOf(success);
      });

      it('예약하려는 좌석이 "예약완료" 상태가면 실패한다.', () => {
        // given
        const command = WriteReservationCommand.from({
          userId: 1,
          performanceId: 10,
          seatId: 15,
        });
        const seatEntity = createRandomSeat(
          command.seatId,
          command.performanceId,
        );
        seatEntity.status = SeatStatus.BOOKED;
        const success = ConflictStatusException;

        // mock
        performanceRepo.getSeatBy.mockResolvedValue(seatEntity);

        // when
        const promiseResult = service.reservationSeat(command);
        // then
        expect(promiseResult).rejects.toBeInstanceOf(success);
      });
    });

    describe('성공한다.', () => {
      it('좌석 임시예약에 성공한다.', async () => {
        // given
        const command = WriteReservationCommand.from({
          userId: 1,
          performanceId: 10,
          seatId: 15,
        });
        const seatEntity = createRandomSeat(
          command.seatId,
          command.performanceId,
        );
        seatEntity.status = SeatStatus.AVAILABLE;

        const newReservationId = 1;
        const success = newReservationId;

        // mock
        performanceRepo.getSeatBy.mockResolvedValue(seatEntity);

        // mock transaction
        mockDataSource.transaction.mockImplementation(async (cb) =>
          cb(mockDataSource),
        );
        performanceRepo.createTransactionRepo.mockReturnValue(performanceRepo);
        reservationRepo.createTransactionRepo.mockReturnValue(reservationRepo);

        performanceRepo.updateSeatStatus.mockResolvedValue();
        reservationRepo.insertOne.mockResolvedValue(newReservationId);

        // when
        const results = await service.reservationSeat(command);

        // then
        expect(results).toBe(success);
      });
    });
  });
});

function createRandomPerformance(
  id: number,
  concertId: number,
): PerformanceEntity {
  const performance = new PerformanceEntity();
  performance.id = id;
  performance.createdAt = new Date();
  performance.updatedAt = new Date();
  performance.openDate = faker.date.future().toISOString().split('T')[0];
  performance.startAt = faker.date.future();
  performance.concertId = concertId;
  return performance;
}

function createRandomSeat(id: number, performanceId: number): SeatEntity {
  const seat = new SeatEntity();
  const randomPosition = () => faker.number.int({ min: 1, max: 50 });

  seat.id = id;
  seat.createdAt = new Date();
  seat.updatedAt = new Date();
  seat.position = randomPosition();
  seat.amount = 50_000;
  seat.status = faker.helpers.arrayElement(Object.values(SeatStatus));
  seat.performanceId = performanceId;
  return seat;
}