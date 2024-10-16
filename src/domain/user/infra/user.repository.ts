import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { UserRepository } from './user-core.repository';
import { UserEntity } from '../domain';

export class UserCoreRepository extends UserRepository {
  constructor(
    @InjectEntityManager()
    readonly manager: EntityManager,
  ) {
    super(UserEntity, manager);
  }
}
