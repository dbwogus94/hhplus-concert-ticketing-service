import { Module } from '@nestjs/common';
import { ReservationModule } from '../reservation';
import { PaymentModule } from '../payment/payment.module';
import { BatchSchedule } from './presentation';
import { BatchFacade } from './application';

@Module({
  imports: [ReservationModule, PaymentModule],
  controllers: [BatchSchedule],
  providers: [BatchFacade],
})
export class BatchModule {}
