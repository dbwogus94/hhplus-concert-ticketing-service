import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';

import { CustomLoggerModule, CustomLoggerService } from 'src/global';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { CustomTypeormLogger } from './custom-typeorm-logger';

export const mysqlDataSourceOptions: MysqlConnectionOptions = {
  type: 'mysql',
  connectorPackage: 'mysql2',
  host: process.env.DATABASE_HOST, // 개발
  port: +process.env.DATABASE_PORT,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [`${__dirname}/../../domain/**/*.entity{.ts,.js}`],
  extra: {
    connectionLimit: 20,
  },
} as const;

export const typeOrmDataSourceOptions: TypeOrmModuleOptions = {
  ...mysqlDataSourceOptions,
};

function createDataSourceOptions(
  logger: CustomLoggerService,
): DataSourceOptions {
  const loggingLevel = CustomTypeormLogger.logLevelParser(
    process.env.DATABASE_LOG,
  );

  return {
    ...mysqlDataSourceOptions,
    logger: new CustomTypeormLogger(logger, loggingLevel),
  };
}

export function getTypeOrmModuleAsyncOptions(): TypeOrmModuleAsyncOptions {
  return {
    imports: [CustomLoggerModule],
    inject: [CustomLoggerService],
    useFactory: (logger: CustomLoggerService) =>
      createDataSourceOptions(logger),
  };
}
