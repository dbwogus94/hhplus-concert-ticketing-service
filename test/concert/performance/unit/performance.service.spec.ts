import { type MockProxy, mock } from 'jest-mock-extended';
import { DataSource } from 'typeorm';

import { ConflictStatusException, ResourceNotFoundException } from 'src/common';
import {
  GetPerformancesInfo,
  GetSeatsInfo,
  PerformanceRepository,
  PerformanceService,
  ReservationRepository,
  ReservationStatus,
  SeatStatus,
  WriteReservationCommand,
} from 'src/domain/concert/performance';
import { MockEntityGenerator } from 'test/fixture';

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
          MockEntityGenerator.generatePerformance(i + 1, concertId),
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

  describe('getAvailableSeats', () => {
    describe('성공한다.', () => {
      it('공연 ID가 없거나 공연 ID에 해당하는 좌석이 없으면 빈배열을 리턴한다.', async () => {
        // give
        const performanceId = 10;
        const success = 0;

        // mock
        performanceRepo.getSeatsBy.mockResolvedValue([]);

        // when
        const results = await service.getAvailableSeats(performanceId);

        // then
        expect(results.length).toBe(success);
      });

      it('공연 ID를 가진 좌석 리스트를 응답한다.', async () => {
        // give
        const performanceId = 10;
        const seatEntities = Array.from({ length: 50 }, (_, i) =>
          MockEntityGenerator.generateSeat(i + 1, performanceId),
        );
        const success = GetSeatsInfo.of(seatEntities);

        // mock
        performanceRepo.getSeatsBy.mockResolvedValue(seatEntities);

        // when
        const results = await service.getAvailableSeats(performanceId);

        // then
        expect(results.length).toBe(success.length);
        expect(results).toEqual(success);
        expect(results.every((r) => r.status === SeatStatus.AVAILABLE)).toEqual(
          true,
        );
      });
    });
  });

  describe('reserveSeat', () => {
    describe('실패한다.', () => {
      it('예약하려는 좌석이 존재하지 않으면 실패한다.', async () => {
        // given
        const command = WriteReservationCommand.from({
          userId: 1,
          performanceId: 10,
          seatId: 100,
        });
        const success = ResourceNotFoundException;

        // mock transaction
        mockDataSource.transaction.mockImplementation(async (cb) =>
          cb(mockDataSource),
        );
        performanceRepo.createTransactionRepo.mockReturnValue(performanceRepo);
        reservationRepo.createTransactionRepo.mockReturnValue(reservationRepo);

        // mock
        performanceRepo.getSeatByPk.mockRejectedValue(
          new ResourceNotFoundException(),
        );

        // when & then
        await expect(service.reserveSeat(command)) //
          .rejects.toBeInstanceOf(success);
      });

      it('예약하려는 좌석이 "임시예약" 상태면 실패한다.', async () => {
        // given
        const command = WriteReservationCommand.from({
          userId: 1,
          performanceId: 10,
          seatId: 15,
        });
        const seatEntity = MockEntityGenerator.generateSeat(
          command.seatId,
          command.performanceId,
        );

        seatEntity.status = SeatStatus.RESERVED;
        const success = ConflictStatusException;

        // mock transaction
        mockDataSource.transaction.mockImplementation(async (cb) =>
          cb(mockDataSource),
        );
        performanceRepo.createTransactionRepo.mockReturnValue(performanceRepo);
        reservationRepo.createTransactionRepo.mockReturnValue(reservationRepo);

        // mock
        performanceRepo.getSeatByPk.mockRejectedValue(
          new ConflictStatusException(),
        );

        // when & then
        await expect(service.reserveSeat(command)) //
          .rejects.toBeInstanceOf(success);
      });

      it('예약하려는 좌석이 "예약완료" 상태가면 실패한다.', async () => {
        // given
        const command = WriteReservationCommand.from({
          userId: 1,
          performanceId: 10,
          seatId: 15,
        });
        const seatEntity = MockEntityGenerator.generateSeat(
          command.seatId,
          command.performanceId,
        );
        seatEntity.status = SeatStatus.BOOKED;
        const success = ConflictStatusException;

        // mock transaction
        mockDataSource.transaction.mockImplementation(async (cb) =>
          cb(mockDataSource),
        );
        performanceRepo.createTransactionRepo.mockReturnValue(performanceRepo);
        reservationRepo.createTransactionRepo.mockReturnValue(reservationRepo);

        // mock
        performanceRepo.getSeatByPk.mockResolvedValue(seatEntity);

        // when & then
        await expect(service.reserveSeat(command)) //
          .rejects.toBeInstanceOf(success);
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
        const seatEntity = MockEntityGenerator.generateSeat(
          command.seatId,
          command.performanceId,
        );
        seatEntity.status = SeatStatus.AVAILABLE;

        const newReservationId = 1;
        const success = newReservationId;

        // mock
        performanceRepo.getSeatByPk.mockResolvedValue(seatEntity);

        // mock transaction
        mockDataSource.transaction.mockImplementation(async (cb) =>
          cb(mockDataSource),
        );
        performanceRepo.createTransactionRepo.mockReturnValue(performanceRepo);
        reservationRepo.createTransactionRepo.mockReturnValue(reservationRepo);

        performanceRepo.updateSeatStatus.mockResolvedValue();
        reservationRepo.insertOne.mockResolvedValue(newReservationId);

        // when
        const results = await service.reserveSeat(command);

        // then
        expect(results).toBe(success);
      });
    });
  });

  describe('getSeatReservation', () => {
    describe('성공한다.', () => {
      it('유효한 예약 신청 상태의 예약을 반환한다.', async () => {
        // given
        const reservationId = 1;
        const userId = 10;
        const mockReservation = MockEntityGenerator.generateReservation({
          id: reservationId,
          userId,
        });

        // mock
        reservationRepo.getReservationBy.mockResolvedValue(mockReservation);

        // when
        const result = await service.getSeatReservation(reservationId, userId);

        // then
        expect(result).toEqual(mockReservation);
        expect(reservationRepo.getReservationBy).toHaveBeenCalledWith({
          id: reservationId,
          userId,
        });
      });
    });

    describe('실패한다.', () => {
      it('예약 신청 상태가 아니면 실패한다.', async () => {
        // given
        const reservationId = 1;
        const userId = 10;
        const mockReservation = MockEntityGenerator.generateReservation({
          id: reservationId,
          userId,
        });
        mockReservation.status = ReservationStatus.CANCEL;

        // mock
        reservationRepo.getReservationBy.mockResolvedValue(mockReservation);

        // when & then
        await expect(
          service.getSeatReservation(reservationId, userId),
        ).rejects.toThrow(ConflictStatusException);
      });
    });
  });

  describe('bookingSeat', () => {
    describe('성공한다.', () => {
      it('좌석 예약을 완료 상태로 변경한다.', async () => {
        // given
        const seatId = 1;
        const mockSeat = MockEntityGenerator.generateSeat(seatId, 1);
        mockSeat.status = SeatStatus.RESERVED;

        const mockReservation = MockEntityGenerator.generateReservation({
          id: 1,
          seatId: mockSeat.id,
        });
        mockReservation.status = ReservationStatus.REQUEST;
        const success = ReservationStatus.CONFIRM;

        // mock transaction
        mockDataSource.transaction.mockImplementation(async (cb) =>
          cb(mockDataSource),
        );
        performanceRepo.createTransactionRepo.mockReturnValue(performanceRepo);
        reservationRepo.createTransactionRepo.mockReturnValue(reservationRepo);

        // mock
        performanceRepo.getSeatByPk.mockResolvedValue(mockSeat);
        reservationRepo.getReservationBy.mockResolvedValue(mockReservation);
        performanceRepo.updateSeatStatus.mockResolvedValue();
        reservationRepo.updateReservationStatus.mockResolvedValue();

        // when
        await service.bookingSeat(seatId);

        // then
        expect(performanceRepo.updateSeatStatus).toHaveBeenCalledWith(
          seatId,
          SeatStatus.BOOKED,
        );
        expect(reservationRepo.updateReservationStatus).toHaveBeenCalled();
        expect(mockReservation.status).toBe(success);
      });
    });

    describe('실패한다.', () => {
      it('트랜잭션 중 에러가 발생하면 롤백된다.', async () => {
        // given
        const seatId = 1;
        // const mockSeat = MockEntityGenerator.generateSeat(seatId, 1);

        // mock transaction
        mockDataSource.transaction.mockRejectedValue(
          new Error('Transaction failed'),
        );

        // when & then
        await expect(service.bookingSeat(seatId)).rejects.toThrow(
          'Transaction failed',
        );
      });
    });
  });
});
