import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';

import { typeOrmDataSourceOptions } from 'src/common';

import {
  PointCoreRepository,
  PointEntity,
  PointHistoryEntity,
  PointRepository,
  UserCoreRepository,
  UserEntity,
  UserFacade,
  UserRepository,
  UserService,
  WriteUserPointCommand,
} from 'src/domain/user';
import { PointFactory, UserFactory } from 'test/fixture';
import { DistributedLockModule, DistributedLockProvider } from 'src/global';

describe('UserFacade 동시성 통합 테스트', () => {
  let userFacade: UserFacade;
  let dataSource: DataSource;
  let manager: EntityManager;
  let lockProvider: DistributedLockProvider;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...typeOrmDataSourceOptions,
          synchronize: true,
          logging: false,
        }),
        DistributedLockModule.forRoot(),
      ],
      providers: [
        UserFacade,
        UserService,
        {
          provide: UserRepository,
          useClass: UserCoreRepository,
        },
        {
          provide: PointRepository,
          useClass: PointCoreRepository,
        },
      ],
    }).compile();

    userFacade = module.get<UserFacade>(UserFacade);
    dataSource = module.get<DataSource>(getDataSourceToken());
    manager = dataSource.manager;
    lockProvider = module.get<DistributedLockProvider>(DistributedLockProvider);
  });

  beforeEach(async () => {
    await manager.clear(PointHistoryEntity);
    await manager.clear(PointEntity);
    await manager.clear(UserEntity);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await lockProvider.disconnect();
  });

  describe('chargeUserPoint 동시성 통합 테스트', () => {
    it('사용자는 여러번의 포인트 충전을 요청하면 한 번만 성공한다. ', async () => {
      // Given
      const point = PointFactory.create({ id: 1, amount: 1_000_000 });
      const user = UserFactory.create({ id: 1, pointId: point.id });
      await manager.save(point);
      await manager.save(user);

      const command = WriteUserPointCommand.from({
        userId: user.id,
        amount: 500,
      });

      // When
      const length = 10;
      const results = await Promise.allSettled(
        Array.from({ length }, () => userFacade.chargeUserPoint(command)),
      );

      // Then
      const successCount = results.filter(
        (result) => result.status === 'fulfilled',
      ).length;
      const failCount = results.filter(
        (result) => result.status === 'rejected',
      ).length;

      expect(successCount).toBe(length);
      expect(failCount).toBe(0);

      const userPoint = await userFacade.getUserPoint(user.id);
      expect(userPoint.amount).toBe(command.amount * length + point.amount);
    });
  });
});
