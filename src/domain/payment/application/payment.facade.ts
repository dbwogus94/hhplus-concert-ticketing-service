import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { ReservationService } from 'src/domain/reservation';
import { UserService, WriteUserPointCommand } from 'src/domain/user';
import {
  GetPaymentInfo,
  PaymentService,
  WriteOutboxCommand,
  WritePaymentCommand,
} from '../doamin';
import { PaymentEventListener, PayPaymentSyncEvent } from '../presentation';
import { WritePaymentCriteria } from './dto';

@Injectable()
export class PaymentFacade {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly userService: UserService,
    private readonly reservationService: ReservationService,
    @InjectEntityManager() private readonly manager: EntityManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async payment(criteria: WritePaymentCriteria): Promise<GetPaymentInfo> {
    const { reservationId, userId } = criteria;

    return await this.manager.transaction(async (txManager) => {
      // 예약 확인
      const reservation = await this.reservationService.getReservation(
        reservationId,
        userId,
      )(txManager);
      const payPrice = reservation.price;

      // 포인트 사용
      await this.userService.useUserPoint(
        WriteUserPointCommand.from({
          userId,
          amount: payPrice,
        }),
      )(txManager);

      // 결제 생성
      const paymentInfo = await this.paymentService.payment(
        WritePaymentCommand.from({
          userId,
          reservationId,
          payPrice,
        }),
      )(txManager);

      await this.eventEmitter.emitAsync(
        PaymentEventListener.PAY_OUTBOX_EVENT,
        PayPaymentSyncEvent.from({
          paymentId: paymentInfo.id,
          payload: JSON.stringify(paymentInfo),
        }),
      );

      return paymentInfo;
    });
  }

  async createOutbox(command: WriteOutboxCommand) {
    return this.paymentService.createOutbox(command);
  }

  async emitOutbox(transactionId: number) {
    return this.reservationService.emitOutbox(transactionId);
  }
}
