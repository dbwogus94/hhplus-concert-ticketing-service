import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DomainModule } from './domain/domain.module';
import {
  ConvertExceptionInterceptor,
  ConvertResponseInterceptor,
  typeOrmDataSourceOptions,
} from './common';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...typeOrmDataSourceOptions,
      logging: true,
    }),
    ScheduleModule.forRoot(),
    DomainModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 응답 포멧팅 처리
    { provide: APP_INTERCEPTOR, useClass: ConvertResponseInterceptor },
    // 예외 처리
    { provide: APP_INTERCEPTOR, useClass: ConvertExceptionInterceptor },
  ],
})
export class AppModule {}
