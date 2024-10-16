import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { PointEntity } from '../domain';
import { PointRepository } from './point-core.repository';

export class PointCoreRepository extends PointRepository {
  constructor(
    @InjectEntityManager()
    readonly manager: EntityManager,
  ) {
    super(PointEntity, manager);
  }
}
