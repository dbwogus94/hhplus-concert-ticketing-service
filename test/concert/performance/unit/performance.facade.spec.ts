import { type MockProxy, mock } from 'jest-mock-extended';

import { ConflictStatusException, ResourceNotFoundException } from 'src/common';
import {
  GetPerformancesInfo,
  GetSeatsInfo,
  PerformanceFacade,
  PerformanceService,
  SeatStatus,
  WriteReservationCommand,
} from 'src/domain/concert/performance';
import { MockEntityGenerator } from 'test/fixture';

describe('PerformanceFacade', () => {
  let performanceService: MockProxy<PerformanceService>;
  let facade: PerformanceFacade;

  beforeEach(() => {
    performanceService = mock<PerformanceService>();
    facade = new PerformanceFacade(performanceService);
  });

  describe('getPerformances', () => {
    describe('성공한다.', () => {
      it('콘서트 ID가 없거나 콘서트 ID에 해당하는 공연이 없으면 빈배열을 리턴한다.', async () => {
        // give
        const concertId = 10;
        const success = 0;

        performanceService.getPerformances.mockResolvedValue([]);

        // when
        const results = await facade.getPerformances(concertId);

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
        // mock
        performanceService.getPerformances.mockResolvedValue(success);

        // when
        const results = await facade.getPerformances(concertId);

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
        performanceService.getAvailableSeats.mockResolvedValue([]);

        // when
        const results = await facade.getAvailableSeats(performanceId);

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
        performanceService.getAvailableSeats.mockResolvedValue(success);

        // when
        const results = await facade.getAvailableSeats(performanceId);

        // then
        expect(results.length).toBe(success.length);
        expect(results).toEqual(success);
        expect(results.every((r) => r.status === SeatStatus.AVAILABLE)).toEqual(
          true,
        );
      });
    });
  });

  describe('reservationSeat', () => {
    describe('실패한다.', () => {
      it('TODO: 유저가 존재하지 않으면 실패힌다.', async () => {
        // given
        const command = WriteReservationCommand.from({
          userId: 1,
          performanceId: 10,
          seatId: 100,
        });
        const success = ResourceNotFoundException;

        // mock
        performanceService.reservationSeat.mockRejectedValue(
          new ResourceNotFoundException(),
        );

        // when & then
        try {
          // when
          await facade.reservationSeat(command);
        } catch (error) {
          // then
          expect(error).toBeInstanceOf(success);
        }
      });

      it('예약하려는 좌석이 존재하지 않으면 실패한다.', async () => {
        // given
        const command = WriteReservationCommand.from({
          userId: 1,
          performanceId: 10,
          seatId: 100,
        });
        const success = ResourceNotFoundException;

        // mock
        performanceService.reservationSeat.mockRejectedValue(
          new ResourceNotFoundException(),
        );

        // when & then
        try {
          // when
          await facade.reservationSeat(command);
        } catch (error) {
          // then
          expect(error).toBeInstanceOf(success);
        }
      });

      it('예약하려는 좌석이 "임시예약" 상태면 실패한다.', async () => {
        // given
        const command = WriteReservationCommand.from({
          userId: 1,
          performanceId: 10,
          seatId: 15,
        });
        const success = ConflictStatusException;

        // mock
        performanceService.reservationSeat.mockRejectedValue(
          new ConflictStatusException(),
        );

        try {
          // when
          await facade.reservationSeat(command);
        } catch (error) {
          // then
          expect(error).toBeInstanceOf(success);
        }
      });

      it('예약하려는 좌석이 "예약완료" 상태가면 실패한다.', async () => {
        // given
        const command = WriteReservationCommand.from({
          userId: 1,
          performanceId: 10,
          seatId: 15,
        });
        const success = ConflictStatusException;

        // mock
        performanceService.reservationSeat.mockRejectedValue(
          new ConflictStatusException(),
        );

        try {
          // when
          await facade.reservationSeat(command);
        } catch (error) {
          // then
          expect(error).toBeInstanceOf(success);
        }
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
        const newReservationId = 1;
        const success = newReservationId;

        // mock
        performanceService.reservationSeat.mockResolvedValue(newReservationId);

        // when
        const results = await facade.reservationSeat(command);

        // then
        expect(results).toBe(success);
      });

      describe('만료한다.', () => {
        it.skip('TODO: 좌석 임시예약에 성공하면 토큰이 만료된다.', async () => {
          // given
          // mock
          // when
          // then
        });
      });
    });
  });
});
