import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

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
    connectionLimit: 50,
  },
} as const;

export const typeOrmDataSourceOptions: TypeOrmModuleOptions = {
  // ...sqliteDataSourceOptions,
  ...mysqlDataSourceOptions,
};
