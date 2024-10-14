import { Module } from '@nestjs/common';
import { PaymentController } from './presentation/payment.controller';
import { PaymentService } from './doamin/payment.service';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
