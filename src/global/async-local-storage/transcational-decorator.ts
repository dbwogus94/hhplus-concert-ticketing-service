import { InjectDataSource } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Aspect, LazyDecorator, WrapParams } from '@toss/nestjs-aop';
import { AsyncLocalStorage } from 'async_hooks';
import {
  TRANSACTIONAL_DACORATOR,
  TransactionalDacoratorOptions,
} from '../../common/decorator/transaction.decorator';
import { Injectable } from '@nestjs/common';

type Storage = { txManager: EntityManager };

@Aspect(TRANSACTIONAL_DACORATOR)
@Injectable()
export class TransactionalDecorator
  implements LazyDecorator<any, TransactionalDacoratorOptions>
{
  constructor(
    private readonly asyncStorage: AsyncLocalStorage<Storage>,
    @InjectDataSource() private readonly manager: EntityManager,
  ) {}

  async wrap({
    method,
    metadata,
  }: WrapParams<any, TransactionalDacoratorOptions>) {
    return (...args: any) => {
      return this.manager.transaction(async (txManager) => {
        return this.asyncStorage.run({ txManager }, () => method(...args));
      });
    };
  }
}
