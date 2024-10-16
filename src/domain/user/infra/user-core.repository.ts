import { BaseRepository } from 'src/common';
import { UserEntity } from '../domain';

export abstract class UserRepository extends BaseRepository<UserEntity> {}
