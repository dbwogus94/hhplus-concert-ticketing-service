import { Injectable } from '@nestjs/common';
import { PaymentService } from 'src/domain/payment/doamin';
import { ReservationService } from 'src/domain/reservation';

@Injectable()
export class BatchFacade {
  constructor(
    private readonly reservationService: ReservationService,
    private readonly paymentService: PaymentService,
  ) {}

  async reProducingReservationOutBox() {}

  async reProducingPaymentOutBox() {}
}
