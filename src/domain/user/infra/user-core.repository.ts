import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { ResourceNotFoundException } from 'src/common';
import { UserEntity } from '../domain';
import { UserRepository } from './user.repository';

export class UserCoreRepository extends UserRepository {
  constructor(
    @InjectEntityManager()
    readonly manager: EntityManager,
  ) {
    super(UserEntity, manager);
  }

  override async getUserByPK(userId: number): Promise<UserEntity> {
    const user = await this.findOneBy({ id: userId });
    if (!user) throw new ResourceNotFoundException('유저가 존재하지 않습니다.');
    return user;
  }
}
