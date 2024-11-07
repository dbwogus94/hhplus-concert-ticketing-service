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
  RedisCacheStore,
} from './common';
import { DomainModule } from './domain';
import { AopModule, CustomLoggerModule } from './global';
import { CacheModule } from '@nestjs/cache-manager';
import Redis from 'ioredis';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      ...getTypeOrmModuleAsyncOptions(),
    }),
    CacheModule.register({
      store: new RedisCacheStore(new Redis()),
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),

    CustomLoggerModule.forRoot(),
    AopModule.forRoot(),
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
