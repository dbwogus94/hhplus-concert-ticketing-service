import { mysqlDataSourceOptions } from 'src/common';
import { DataSource } from 'typeorm';

export const OrmDataSource = new DataSource({
  // ...sqliteDataSourceOptions,
  ...mysqlDataSourceOptions,
  // synchronize: true,
  // dropSchema: true,
  logging: true,
  // logging: ['error', 'warn'],
});

// eslint-disable-next-line @typescript-eslint/ban-types
export const runOrm = (callback: (dataSource: DataSource) => Promise<void>) =>
  OrmDataSource.initialize()
    .then(async (dataSource) => {
      console.log('Data Source has been initialized!');
      await callback(dataSource);
    })
    .catch((err) => {
      console.error('Error during Data Source initialization', err);
    })
    .finally(async () => {
      console.log('Data Source has been Destroy!');
      await OrmDataSource.destroy();
    });
