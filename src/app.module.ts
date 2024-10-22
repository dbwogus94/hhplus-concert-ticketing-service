import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  ConvertExceptionInterceptor,
  ConvertResponseInterceptor,
  getTypeOrmModuleAsyncOptions,
} from './common';
import { DomainModule } from './domain';
import { AsyncLocalStorageModule, CustomLoggerModule } from './global';
import { AopModule } from '@toss/nestjs-aop';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      ...getTypeOrmModuleAsyncOptions(),
    }),
    ScheduleModule.forRoot(),
    AopModule,
    CustomLoggerModule.forRoot(),
    AsyncLocalStorageModule.forRoot(),
    DomainModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 전역 응답 포멧팅 처리
    { provide: APP_INTERCEPTOR, useClass: ConvertResponseInterceptor },
    // 전역 예외 처리
    { provide: APP_INTERCEPTOR, useClass: ConvertExceptionInterceptor },
  ],
})
export class AppModule {}
