import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { execSync } from 'child_process';
import { DataSource } from 'typeorm';

import { ConflictStatusException, typeOrmDataSourceOptions } from 'src/common';

import {
  PointCoreRepository,
  PointRepository,
  UserCoreRepository,
  UserFacade,
  UserRepository,
  UserService,
  WriteUserPointCommand,
} from 'src/domain/user';

describe('UserFacade 동시성 통합 테스트', () => {
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

  describe('chargeUserPoint 동시성 통합 테스트', () => {
    it('사용자는 여러번의 포인트 충전을 요청하면 한 번만 성공한다. ', async () => {
      // Given
      const userId = 1;
      const initialPoint = 1_000_000;
      const chargeAmount = 500;

      const command = WriteUserPointCommand.from({
        userId,
        amount: chargeAmount,
      });

      // When
      const results = await Promise.allSettled([
        userFacade.chargeUserPoint(command),
        userFacade.chargeUserPoint(command),
        userFacade.chargeUserPoint(command),
      ]);

      // Then
      const successCount = results.filter(
        (result) => result.status === 'fulfilled',
      ).length;
      const failCount = results.filter(
        (result) => result.status === 'rejected',
      ).length;
      expect(successCount).toBe(1);
      expect(failCount).toBe(results.length - 1);
      expect(
        results.filter((result) => result.status === 'rejected')[0].reason,
      ).toBeInstanceOf(ConflictStatusException);

      // 추가 검증: 사용자 포인트가 차감되었는지 확인
      const userPoint = await userFacade.getUserPoint(userId);
      expect(userPoint.amount).toBe(initialPoint + chargeAmount);
    });
  });
});
