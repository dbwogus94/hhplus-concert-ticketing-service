import { Module, DynamicModule, Logger as NestLogger } from '@nestjs/common';
import { CustomLoggerService } from './custom-logger.service';

@Module({})
export class CustomLoggerModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: CustomLoggerModule,
      providers: [CustomLoggerService, NestLogger],
      exports: [CustomLoggerService],
    };
  }
}
