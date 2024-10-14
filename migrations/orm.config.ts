import { mysqlDataSourceOptions } from 'src/common';
import { DataSource } from 'typeorm';

export const OrmDataSource = new DataSource({
  ...mysqlDataSourceOptions,
  migrations: [`${__dirname}/**/local/*{.ts,.js}`],
  migrationsTableName: 'migrations',
  // logging: true,
});
