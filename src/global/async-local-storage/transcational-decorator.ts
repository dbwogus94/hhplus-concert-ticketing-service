import { InjectDataSource } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Aspect, LazyDecorator, WrapParams } from '@toss/nestjs-aop';
import { AsyncLocalStorage } from 'async_hooks';
import {
  TRANSACTIONAL_DACORATOR,
  TransactionalDacoratorOptions,
} from 'src/common';
import { Injectable } from '@nestjs/common';

@Aspect(TRANSACTIONAL_DACORATOR)
@Injectable()
export class TransactionalDecorator
  implements LazyDecorator<any, TransactionalDacoratorOptions>
{
  constructor(
    private readonly asyncStorage: AsyncLocalStorage<any>,
    @InjectDataSource() private readonly dataSource: EntityManager,
  ) {}

  async wrap({
    method,
    metadata,
  }: WrapParams<any, TransactionalDacoratorOptions>) {
    return (...args: any) => {
      return this.dataSource.transaction(async (txManager) => {
        return this.asyncStorage.run({ txManager }, () => method(...args));
      });
    };
  }
}
