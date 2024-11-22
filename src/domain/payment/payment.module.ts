import { Module } from '@nestjs/common';

import { UserModule } from '../user';
import { ReservationModule } from '../reservation';
import { PaymentController, PaymentEventListener } from './presentation';
import { PaymentFacade } from './application';
import { PaymentService, PaymentRepository, PaymentProducer } from './doamin';
import { PaymentCoreProducer, PaymentCoreRepository } from './infra';

@Module({
  imports: [UserModule, ReservationModule],
  controllers: [PaymentController, PaymentEventListener],
  providers: [
    PaymentFacade,
    PaymentService,
    { provide: PaymentRepository, useClass: PaymentCoreRepository },
    { provide: PaymentProducer, useClass: PaymentCoreProducer },
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
