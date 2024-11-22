import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { ConflictStatusException } from 'src/common';
import { ReservationStatus } from './model';
import {
  GetReservationInfo,
  GetReservationOutboxInfo,
  WriteOutboxCommand,
  WriteReservationCommand,
} from './dto';
import { ReservationProducer, ReservationRepository } from './interface';

@Injectable()
export class ReservationService {
  constructor(
    private readonly reservationRepo: ReservationRepository,
    private readonly reservationProducer: ReservationProducer,
  ) {}

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

  async createOutbox(command: WriteOutboxCommand): Promise<void> {
    return this.reservationRepo.saveOutbox({
      transactionId: command.transactionId,
      domainName: command.domainName,
      topic: command.topic,
      payload: command.payload,
      isSent: false,
    });
  }

  async sendOutbox(transactionId: number): Promise<void> {
    const outbox = await this.reservationRepo.getOutboxBy({
      transactionId: transactionId,
      isSent: false,
    });

    await this.reservationProducer.sendRequestReservation({
      ...outbox,
    });

    await this.reservationRepo.saveOutbox({
      id: outbox.id,
      transactionId,
      isSent: true,
    });
  }

  async getOutboxes(): Promise<GetReservationOutboxInfo[]> {
    const outboxes = await this.reservationRepo.getOutboxes();
    return GetReservationOutboxInfo.of(outboxes);
  }
}
