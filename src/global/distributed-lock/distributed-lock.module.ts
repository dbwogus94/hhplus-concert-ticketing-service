import { DynamicModule, Module } from '@nestjs/common';
import { DistributedLockProvider } from './distributed-lock-provider';

@Module({})
export class DistributedLockModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: DistributedLockModule,
      providers: [DistributedLockProvider],
      exports: [DistributedLockProvider],
    };
  }
}
