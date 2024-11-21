import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { DataSource } from 'typeorm';

import { typeOrmDataSourceOptions } from 'src/common';
import { DomainModule } from 'src/domain';
import { CustomLoggerModule, RedisModule } from 'src/global';

let testingModule: TestingModule;
let dataSource: DataSource;

beforeAll(async () => {
  const clientRedis = new Redis({
    host: process.env.REDIS_HOST,
    port: +process.env.REDIS_PORT,
    db: 1,
  });

  testingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        ...typeOrmDataSourceOptions,
        logging: ['warn', 'error'],
      }),
      ScheduleModule.forRoot(),
      EventEmitterModule.forRoot(),
      CustomLoggerModule.forRoot(),
      RedisModule.forRoot(clientRedis),
      DomainModule,
    ],
  }).compile();

  dataSource = testingModule.get<DataSource>(getDataSourceToken());
});

afterAll(async () => {
  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
    await testingModule.close();
  }
});

export const getTestingModule = () => {
  if (!testingModule) {
    throw new Error('TestingModule not initialized');
  }
  return testingModule;
};

export const getTestDataSource = () => dataSource;
