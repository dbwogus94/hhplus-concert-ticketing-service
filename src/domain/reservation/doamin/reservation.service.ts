import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { ConflictStatusException } from 'src/common';
import { ReservationStatus } from './model';
import { GetReservationInfo, WriteReservationCommand } from './dto';
import { ReservationRepository } from '../infra';

@Injectable()
export class ReservationService {
  constructor(private readonly reservationRepo: ReservationRepository) {}

  reserve(
    command: WriteReservationCommand,
  ): (manager?: EntityManager) => Promise<GetReservationInfo> {
    return async (manager: EntityManager = null) => {
      const txReservationRepo = manager
        ? this.reservationRepo.createTransactionRepo(manager)
        : this.reservationRepo;

      const fountReservation = await this.reservationRepo.findReservationBy({
        seatId: command.seatId,
        userId: command.userId,
      });

      if (fountReservation?.isRequest)
        throw new ConflictStatusException(
          '예약을 생성할 수 없습니다.("예약신청" 상태 입니다.)',
        );
      if (fountReservation?.isConfirm)
        throw new ConflictStatusException(
          '예약을 생성할 수 없습니다.("예약확정" 상태가 입니다.)',
        );

      const reservation = await txReservationRepo.save({
        seatId: command.seatId,
        userId: command.userId,
        price: command.price,
        status: ReservationStatus.REQUEST,
      });
      return GetReservationInfo.of(reservation);
    };
  }

  async confirm(reservationId: number): Promise<GetReservationInfo> {
    const reservation = await this.reservationRepo.getReservationBy({
      id: reservationId,
    });

    reservation.confirm();
    await this.reservationRepo.updateReservationStatus(
      reservation.id,
      reservation.status,
    );
    return GetReservationInfo.of(reservation);
  }

  getReservation(
    reservationId: number,
    userId: number,
  ): (manager?: EntityManager) => Promise<GetReservationInfo> {
    return async (manager: EntityManager = null) => {
      const txReservationRepo = manager
        ? this.reservationRepo.createTransactionRepo(manager)
        : this.reservationRepo;

      const reservation = await txReservationRepo.getReservationBy({
        id: reservationId,
        userId,
      });
      if (!reservation.isRequest)
        throw new ConflictStatusException('"예약신청" 상태가 아닙니다.');
      return GetReservationInfo.of(reservation);
    };
  }
}
