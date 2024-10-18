import { FindOneOptions } from 'typeorm';
import { BaseRepository } from 'src/common';
import { PointEntity } from '../domain';
import { PointHistoryType } from '../domain/model/enum';

export type UpdatePointParam = {
  type: PointHistoryType;
  amount: number;
  userId: number;
};
export type FindLockOptions = Pick<FindOneOptions, 'lock'>;

export abstract class PointRepository extends BaseRepository<PointEntity> {
  abstract getPointByPk(
    pointId: number,
    options?: FindLockOptions,
  ): Promise<PointEntity>;
  abstract updatePointWithHistory(
    pointId: number,
    param: UpdatePointParam,
  ): Promise<void>;
}
