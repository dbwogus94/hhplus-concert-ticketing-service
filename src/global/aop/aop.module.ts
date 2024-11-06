import { DynamicModule, Module } from '@nestjs/common';
import { AopModule as TossAopModule } from '@toss/nestjs-aop';
import { CacheAopProvider } from './cache-aop.provider';

@Module({})
export class AopModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: AopModule,
      imports: [TossAopModule],
      providers: [CacheAopProvider],
    };
  }
}
