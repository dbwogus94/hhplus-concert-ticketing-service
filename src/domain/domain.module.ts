import { Module } from '@nestjs/common';

import { ConcertModule } from './concert/concert.module';
import { UserModule } from './user/user.module';
import { QueueModule } from './queue/queue.module';
import { PaymentModule } from './payment/payment.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ConcertModule, UserModule, QueueModule, PaymentModule, AuthModule],
})
export class DomainModule {}
