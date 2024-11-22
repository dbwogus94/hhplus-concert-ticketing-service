import { Module } from '@nestjs/common';

import { ConcertModule } from './concert/concert.module';
import { UserModule } from './user/user.module';
import { QueueModule } from './queue/queue.module';
import { PaymentModule } from './payment/payment.module';
import { ReservationModule } from './reservation/reservation.module';
import { BatchModule } from './batch/batch.module';

@Module({
  imports: [QueueModule, ConcertModule, UserModule, PaymentModule, ReservationModule, BatchModule],
})
export class DomainModule {}
