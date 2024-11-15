import { Module } from '@nestjs/common';

import { ConcertModule } from './concert/concert.module';
import { UserModule } from './user/user.module';
import { QueueModule } from './queue/queue.module';
import { PaymentModule } from './payment/payment.module';
import { ReservationModule } from './reservation/reservation.module';

@Module({
  imports: [QueueModule, ConcertModule, UserModule, PaymentModule, ReservationModule],
})
export class DomainModule {}
