import { DynamicModule, Module } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { TransactionalDecorator } from './transcational-decorator';

@Module({})
export class AsyncLocalStorageModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: AsyncLocalStorageModule,
      providers: [
        TransactionalDecorator,
        {
          provide: AsyncLocalStorage,
          useValue: new AsyncLocalStorage(),
        },
      ],
      exports: [AsyncLocalStorage],
    };
  }
}
