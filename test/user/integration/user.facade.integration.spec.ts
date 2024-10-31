import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';

import { typeOrmDataSourceOptions } from 'src/common';

import { ResourceNotFoundException } from 'src/common';
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
import { PointFactory } from 'test/fixture/point-factory';
import { UserFactory } from 'test/fixture/user-factory';

describe('UserFacade 통합 테스트', () => {
  let userFacade: UserFacade;
  let dataSource: DataSource;
  let manager: EntityManager;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...typeOrmDataSourceOptions,
          synchronize: true,
          logging: false,
        }),
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
  });

  beforeEach(async () => {
    await manager.clear(UserEntity);
    await manager.clear(PointEntity);
    await manager.clear(PointHistoryEntity);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('getUserPoint', () => {
    it('사용자의 포인트를 조회해야 한다', async () => {
      // Given
      const point = PointFactory.create({ id: 1, amount: 1_000_000 });
      const user = UserFactory.create({ id: 1, pointId: point.id });
      await manager.save(point);
      await manager.save(user);

      // When
      const result = await userFacade.getUserPoint(user.id);

      // Then
      expect(result).toBeDefined();
      expect(result.amount).toBe(point.amount);
    });

    it('존재하지 않는 사용자의 포인트를 조회하면 에러가 발생해야 한다', async () => {
      // Given
      const nonExistentUserId = 999;

      // When & Then
      await expect(userFacade.getUserPoint(nonExistentUserId)).rejects.toThrow(
        ResourceNotFoundException,
      );
    });
  });

  describe('chargeUserPoint', () => {
    it('사용자의 포인트를 성공적으로 충전해야 한다', async () => {
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
      const result = await userFacade.chargeUserPoint(command);

      // Then
      expect(result).toBeDefined();
      expect(result.amount).toBe(point.amount + command.amount);
    });

    it('존재하지 않는 사용자의 포인트를 충전하려고 하면 에러가 발생해야 한다', async () => {
      // Given
      const nonExistentUserId = 999;
      const chargeAmount = 500;
      const command = WriteUserPointCommand.from({
        userId: nonExistentUserId,
        amount: chargeAmount,
      });

      // When & Then
      await expect(userFacade.chargeUserPoint(command)).rejects.toThrow(
        ResourceNotFoundException,
      );
    });
  });
});
