import { Injectable } from '@nestjs/common';
import { ReservationRepository } from '../infra';
import { GetReservationInfo, WriteReservationCommand } from './dto';
import { EntityManager } from 'typeorm';
import { ConflictStatusException } from 'src/common';

@Injectable()
export class ReservationService {
  constructor(private readonly reservationRepo: ReservationRepository) {}

  async reserve(command: WriteReservationCommand) {
    const reservationId = await this.reservationRepo.insertOne({
      seatId: command.seatId,
      userId: command.userId,
      price: command.price,
    });
    return reservationId;
  }

  getSeatReservation(
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
