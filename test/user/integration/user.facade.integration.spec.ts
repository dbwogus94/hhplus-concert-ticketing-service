import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

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

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...typeOrmDataSourceOptions,
          synchronize: true,
          dropSchema: true,
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
  });

  beforeEach(async () => {
    await dataSource.manager.clear(UserEntity);
    await dataSource.manager.clear(PointEntity);
    await dataSource.manager.clear(PointHistoryEntity);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('getUserPoint', () => {
    it('사용자의 포인트를 조회해야 한다', async () => {
      // Given
      const userId = 1;
      const pointId = 1;
      const initialPoint = 1_000_000;
      await dataSource.manager.save(
        PointFactory.create({ id: pointId, amount: 1_000_000 }),
      );
      await dataSource.manager.save(
        UserFactory.create({ id: userId, pointId }),
      );

      // When
      const result = await userFacade.getUserPoint(userId);

      // Then
      expect(result).toBeDefined();
      expect(result.amount).toBe(initialPoint);
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

      const command = WriteUserPointCommand.from({
        userId: 1,
        amount: 500,
      });
      const pointId = 1;
      const initialPoint = 1_000_000;

      await dataSource.manager.save(
        PointFactory.create({ id: pointId, amount: initialPoint }),
      );
      await dataSource.manager.save(
        UserFactory.create({ id: command.userId, pointId }),
      );

      // When
      const result = await userFacade.chargeUserPoint(command);

      // Then
      expect(result).toBeDefined();
      expect(result.amount).toBe(initialPoint + command.amount);
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
