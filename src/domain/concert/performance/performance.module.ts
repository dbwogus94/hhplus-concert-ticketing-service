import { Module } from '@nestjs/common';

import { QueueModule } from 'src/domain/queue';
import { UserModule } from 'src/domain/user';
import { PerformanceFacade } from './application';
import { PerformanceService } from './domain/performance.service';
import { PerformanceCoreRepository, PerformanceRepository } from './infra';
import { PerformanceController } from './presentation';

@Module({
  imports: [UserModule, QueueModule],
  controllers: [PerformanceController],
  providers: [
    PerformanceFacade,
    PerformanceService,
    {
      provide: PerformanceRepository,
      useClass: PerformanceCoreRepository,
    },
  ],
  exports: [PerformanceService],
})
export class PerformanceModule {}
