import { Module } from '@nestjs/common';

import { UserModule } from '../user';
import { ReservationModule } from '../reservation';
import { PaymentController } from './presentation';
import { PaymentFacade } from './application';
import { PaymentService } from './doamin';
import { PaymentCoreRepository, PaymentRepository } from './infra';

@Module({
  imports: [UserModule, ReservationModule],
  controllers: [PaymentController],
  providers: [
    PaymentFacade,
    PaymentService,
    { provide: PaymentRepository, useClass: PaymentCoreRepository },
  ],
})
export class PaymentModule {}
