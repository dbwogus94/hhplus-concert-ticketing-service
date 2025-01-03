import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';

import { ConflictStatusException, ResourceNotFoundException } from 'src/common';
import { PerformanceEntity, SeatEntity } from 'src/domain/concert/performance';
import {
  ReservationEntity,
  ReservationFacade,
  ReservationService,
  ReservationStatus,
  WriteReservationCriteria,
} from 'src/domain/reservation';
import { UserEntity } from 'src/domain/user';
import { ReservationFactory, SeatFactory, UserFactory } from 'test/fixture';
import { getTestingModule } from 'test/pre-setup';

describe('ReservationFacade 통합테스트', () => {
  let dataSource: DataSource;
  let manager: EntityManager;

  let reservationFacade: ReservationFacade;
  let reservationService: ReservationService;

  beforeAll(async () => {
    const module = getTestingModule();

    reservationFacade = module.get<ReservationFacade>(ReservationFacade);
    reservationService = module.get<ReservationService>(ReservationService);
    dataSource = module.get<DataSource>(getDataSourceToken());
    manager = dataSource.manager;
  });

  beforeEach(async () => {
    await manager.clear(PerformanceEntity);
    await manager.clear(SeatEntity);
    await manager.clear(ReservationEntity);
    await manager.clear(UserEntity);
  });

  describe('reserve', () => {
    describe('성공한다.', () => {
      it('예약이 성공적으로 생성된다.', async () => {
        // Given
        const user = UserFactory.create({ id: 1, pointId: 1 });
        const seat = SeatFactory.create({ id: 1, amount: 50_000 });
        const saveEntities = [user, seat];
        await Promise.all([saveEntities].map((e) => manager.save(e)));

        const criteria = WriteReservationCriteria.from({
          performanceId: seat.performanceId,
          seatId: seat.id,
          userId: user.id,
        });

        // When
        const reservationId = await reservationFacade.reserve(criteria);

        // 예약이 생성되었는지 확인
        await expect(
          reservationService.getReservation(reservationId, user.id)(),
        ).resolves.toMatchObject({
          id: reservationId,
          status: ReservationStatus.REQUEST,
        });

        // outbox에 추가된 값을 확인한다.
        // => TODO: TestingModule에서는 Event emitAsync를 기다리지 않는 현상이 있다. 떄문에 테스트로 확인이 불가능해 보인다.
        // const outbox = await manager.findOneBy(ReservationOutboxEntity, {
        //   transactionId: reservationId,
        // });
        // expect(outbox.transactionId).toBe(reservationId);
        // expect(outbox.topic).toBe(ReservationEventListener.REQUEST_EVENT);

        // 좌석 상태가 'BOOKED'로 변경되었는지 확인, 이벤트로 분리하며 확인이 불가능하다.
        // const reserveSeat = await performanceService.getReserveSeat(seat.id);
        // expect(reserveSeat.status).toBe(SeatStatus.RESERVED);
      });
    });

    describe('실패한다.', () => {
      it('유저가 존재하지 않으면 에러가 발생한다.', async () => {
        // Given
        const notExistUser = UserFactory.create({ id: 1, pointId: 1 });
        const seat = SeatFactory.create({ id: 1, amount: 50_000 });
        const saveEntities = [seat];
        await Promise.all([saveEntities].map((e) => manager.save(e)));

        const criteria = WriteReservationCriteria.from({
          performanceId: seat.performanceId,
          seatId: seat.id,
          userId: notExistUser.id,
        });

        await expect(
          reservationFacade.reserve(criteria),
        ).rejects.toBeInstanceOf(ResourceNotFoundException);
      });

      it('좌석이 존재하지 않으면 에러가 발생한다.', async () => {
        // Given
        const user = UserFactory.create({ id: 1, pointId: 1 });
        const notExistSeat = SeatFactory.create({ id: 1, amount: 50_000 });

        const saveEntities = [user];
        await Promise.all([saveEntities].map((e) => manager.save(e)));

        const criteria = WriteReservationCriteria.from({
          performanceId: notExistSeat.performanceId,
          seatId: notExistSeat.id,
          userId: user.id,
        });

        await expect(
          reservationFacade.reserve(criteria),
        ).rejects.toBeInstanceOf(ResourceNotFoundException);
      });

      it('좌석이 "예약가능" 상태가 아니라면 에러가 발생한다.', async () => {
        // Given
        const user = UserFactory.create({ id: 1, pointId: 1 });
        const seat = SeatFactory.createBooked({ id: 1, amount: 50_000 });
        const reservation = ReservationFactory.create({
          id: 1,
          userId: user.id,
          seatId: seat.id,
          price: seat.amount,
        });
        const saveEntities = [user, seat, reservation];
        await Promise.all([saveEntities].map((e) => manager.save(e)));

        const criteria = WriteReservationCriteria.from({
          performanceId: seat.performanceId,
          seatId: seat.id,
          userId: user.id,
        });

        await expect(
          reservationFacade.reserve(criteria),
        ).rejects.toBeInstanceOf(ConflictStatusException);
      });
    });

    describe('실패한다. - "좌석 상태가 동기화 되지 않은 경우를 가정"', () => {
      it('선택한 좌석에 대한 예약이 존재하고, "예약신청" 상태라면 에러가 발생한다.', async () => {
        // Given
        const user = UserFactory.create({ id: 1, pointId: 1 });
        const seat = SeatFactory.create({ id: 1, amount: 50_000 });
        const reservation = ReservationFactory.create({
          id: 1,
          userId: user.id,
          seatId: seat.id,
          price: seat.amount,
        });
        const saveEntities = [user, seat, reservation];
        await Promise.all([saveEntities].map((e) => manager.save(e)));

        const criteria = WriteReservationCriteria.from({
          performanceId: seat.performanceId,
          seatId: seat.id,
          userId: user.id,
        });

        await expect(
          reservationFacade.reserve(criteria),
        ).rejects.toBeInstanceOf(ConflictStatusException);
      });

      it('선택한 좌석에 대한 예약이 존재하고, "예약확정" 상태라면 에러가 발생한다.', async () => {
        // Given
        const user = UserFactory.create({ id: 1, pointId: 1 });
        const seat = SeatFactory.create({ id: 1, amount: 50_000 });
        const reservation = ReservationFactory.createConfirm({
          id: 1,
          userId: user.id,
          seatId: seat.id,
          price: seat.amount,
        });
        const saveEntities = [user, seat, reservation];
        await Promise.all([saveEntities].map((e) => manager.save(e)));

        const criteria = WriteReservationCriteria.from({
          performanceId: seat.performanceId,
          seatId: seat.id,
          userId: user.id,
        });

        await expect(
          reservationFacade.reserve(criteria),
        ).rejects.toBeInstanceOf(ConflictStatusException);
      });
    });
  });
});
