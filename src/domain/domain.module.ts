import { Module } from '@nestjs/common';
import { ConcertModule } from './concert/concert.module';
import { OrderModule } from './order/order.module';
import { UserModule } from './user/user.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [ConcertModule, UserModule, OrderModule, QueueModule],
})
export class DomainModule {}
