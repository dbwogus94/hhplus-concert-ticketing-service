import { createDecorator } from '@toss/nestjs-aop';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';

export const TRANSACTIONAL_DACORATOR = Symbol('TRANSACTIONAL_DACORATOR');
export type TransactionalDacoratorOptions = { isolationLevel: IsolationLevel };

export const Transactional = (options?: TransactionalDacoratorOptions) =>
  createDecorator(TRANSACTIONAL_DACORATOR, options);
