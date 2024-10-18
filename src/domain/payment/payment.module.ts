import { Module } from '@nestjs/common';
import { PaymentController } from './presentation/payment.controller';
import { PaymentService } from './doamin/payment.service';
import { PaymentFacade } from './application';
import { PaymentCoreRepository, PaymentRepository } from './infra';
import { PerformanceModule } from '../concert/performance';
import { UserModule } from '../user';

@Module({
  imports: [PerformanceModule, UserModule],
  controllers: [PaymentController],
  providers: [
    PaymentFacade,
    PaymentService,
    { provide: PaymentRepository, useClass: PaymentCoreRepository },
  ],
})
export class PaymentModule {}
