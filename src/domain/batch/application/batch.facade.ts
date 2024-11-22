import { Injectable } from '@nestjs/common';
import { PaymentService } from 'src/domain/payment/doamin';
import { ReservationService } from 'src/domain/reservation';

@Injectable()
export class BatchFacade {
  constructor(
    private readonly reservationService: ReservationService,
    private readonly paymentService: PaymentService,
  ) {}

  async reProducingReservationOutBox() {
    const reservationOutboxes = await this.reservationService.getOutboxes();

    const promises = reservationOutboxes.map((outbox) => {
      return this.reservationService.sendOutbox(outbox.transactionId);
    });
    await Promise.all(promises);
  }

  async reProducingPaymentOutBox() {
    const paymentOutboxes = await this.paymentService.getOutboxes();

    const promises = paymentOutboxes.map((outbox) => {
      return this.reservationService.sendOutbox(outbox.transactionId);
    });
    await Promise.all(promises);
  }
}
