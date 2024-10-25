import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { execSync } from 'child_process';

import { typeOrmDataSourceOptions } from 'src/common';

import { ResourceNotFoundException } from 'src/common';
import {
  PointCoreRepository,
  PointRepository,
  UserCoreRepository,
  UserFacade,
  UserRepository,
  UserService,
  WriteUserPointCommand,
} from 'src/domain/user';

describe('UserFacade 통합 테스트', () => {
  let userFacade: UserFacade;
  let dataSource: DataSource;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...typeOrmDataSourceOptions,
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
    // userService = module.get<UserService>(UserService);

    dataSource = module.get<DataSource>(getDataSourceToken());
  });

  beforeEach(() => {
    execSync('npm run db:drop', { stdio: 'inherit' });
    execSync('npm run db:migrate:up', { stdio: 'inherit' });
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('getUserPoint', () => {
    it('사용자의 포인트를 조회해야 한다', async () => {
      // Given
      const userId = 1;
      const initialPoint = 1_000_000;

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
      const userId = 1;
      const initialPoint = 1_000_000;
      const chargeAmount = 500;

      const command = WriteUserPointCommand.from({
        userId,
        amount: chargeAmount,
      });

      // When
      const result = await userFacade.chargeUserPoint(command);

      // Then
      expect(result).toBeDefined();
      expect(result.amount).toBe(initialPoint + chargeAmount);
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
