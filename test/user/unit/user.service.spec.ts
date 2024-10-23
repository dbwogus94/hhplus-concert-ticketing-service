import { type MockProxy, mock } from 'jest-mock-extended';
import { EntityManager } from 'typeorm';

import {
  ConflictStatusException,
  ResourceNotFoundException,
  RunTimeException,
} from 'src/common';
import {
  GetUserInfo,
  GetUserPointInfo,
  PointRepository,
  UserRepository,
  UserService,
  WriteUserPointCommand,
} from 'src/domain/user';
import { MockEntityGenerator } from 'test/fixture';

describe('UserService', () => {
  let mockManamer: MockProxy<EntityManager>;
  let userRepo: MockProxy<UserRepository>;
  let pointRepo: MockProxy<PointRepository>;
  let service: UserService;

  beforeEach(() => {
    mockManamer = mock<EntityManager>();
    userRepo = mock<UserRepository>();
    pointRepo = mock<PointRepository>();
    service = new UserService(userRepo, pointRepo, mockManamer);
  });

  describe('getUser', () => {
    describe('실패한다.', () => {
      it('유저가 존재하지 않으면 실패한다.', async () => {
        // given
        const userId = -1;
        const success = ResourceNotFoundException;

        // mock
        userRepo.getUserByPK.mockRejectedValue(new ResourceNotFoundException());

        // when & then
        await expect(service.getUser(userId)) //
          .rejects.toBeInstanceOf(success);
      });
    });

    describe('성공한다.', () => {
      it('유저 ID에 해당하는 유저 조회에 성공한다.', async () => {
        // given
        const userId = -1;
        const userEntity = MockEntityGenerator.generateUser({
          id: userId,
          pointId: 1,
        });
        const success = GetUserInfo.of(userEntity);

        // mock
        userRepo.getUserByPK.mockResolvedValue(userEntity);

        const result = await service.getUser(userId);
        // when & then
        expect(result).toEqual(success);
      });
    });
  });

  describe('getUserPoint', () => {
    describe('실패한다.', () => {
      it('유저가 존재하지 않으면 포인트 조회에 실패한다.', async () => {
        // given
        const userId = -1;
        const success = ResourceNotFoundException;

        // mock
        userRepo.getUserByPK.mockRejectedValue(new ResourceNotFoundException());

        // when & then
        await expect(service.getUserPoint(userId)) //
          .rejects.toBeInstanceOf(success);
      });

      it('유저에게 포인트가 존재하지 않으면 실패한다.', async () => {
        // given
        const userId = -1;
        const userEntity = MockEntityGenerator.generateUser({
          id: userId,
          pointId: 1,
        });
        const success = RunTimeException;

        // mock
        userRepo.getUserByPK.mockResolvedValue(userEntity);
        pointRepo.getPointByPk.mockRejectedValue(new RunTimeException());

        // when & then
        await expect(service.getUserPoint(userId)) //
          .rejects.toBeInstanceOf(success);
      });
    });

    describe('성공한다.', () => {
      it('유저가 존재하고 유저가 포인트를 가지고 있으면 성공한다.', async () => {
        // given
        const userId = -1;
        const pointId = 1;
        const userEntity = MockEntityGenerator.generateUser({
          id: userId,
          pointId,
        });
        const pointEntity = MockEntityGenerator.generatePoint({ id: pointId });
        const success = GetUserPointInfo.of(pointEntity);

        // mock
        userRepo.getUserByPK.mockResolvedValue(userEntity);
        pointRepo.getPointByPk.mockResolvedValue(pointEntity);

        const result = await service.getUserPoint(userId);
        // when & then
        expect(result).toEqual(success);
      });
    });
  });

  describe('chargeUserPoint', () => {
    describe('실패한다.', () => {
      it('유저가 존재하지 않으면 실패한다.', async () => {
        // given
        const command = WriteUserPointCommand.from({
          userId: -1,
          amount: 100_000,
        });
        const success = ResourceNotFoundException;

        // mock transaction
        mockManamer.transaction.mockImplementation(async (cb) =>
          cb(mockManamer),
        );
        userRepo.createTransactionRepo.mockReturnValue(userRepo);
        pointRepo.createTransactionRepo.mockReturnValue(pointRepo);

        // mock
        userRepo.getUserByPK.mockRejectedValue(new ResourceNotFoundException());

        // when & then
        await expect(service.chargeUserPoint(command)) //
          .rejects.toBeInstanceOf(success);
      });

      it('유저에게 포인트가 존재하지 않으면 실패한다.', async () => {
        // given
        const command = WriteUserPointCommand.from({
          userId: 1,
          amount: 100_000,
        });
        const userEntity = MockEntityGenerator.generateUser({
          id: command.userId,
          pointId: null,
        });
        const success = RunTimeException;

        // mock transaction
        mockManamer.transaction.mockImplementation(async (cb) =>
          cb(mockManamer),
        );
        userRepo.createTransactionRepo.mockReturnValue(userRepo);
        pointRepo.createTransactionRepo.mockReturnValue(pointRepo);

        // mock
        userRepo.getUserByPK.mockResolvedValue(userEntity);
        pointRepo.getPointByPk.mockRejectedValue(new RunTimeException());

        // when & then
        await expect(service.chargeUserPoint(command)) //
          .rejects.toBeInstanceOf(success);
      });
    });

    describe('성공한다.', () => {
      it('유저가 존재하고 유저가 포인트를 가지고 있으면 충전에 성공한다.', async () => {
        // given
        const pointId = 1;
        const command = WriteUserPointCommand.from({
          userId: 1,
          amount: 100_000,
        });
        const userEntity = MockEntityGenerator.generateUser({
          id: command.userId,
          pointId,
        });
        const pointEntity = MockEntityGenerator.generatePoint({
          id: pointId,
          amount: 100_000,
        });
        const success = pointEntity.amount + command.amount;

        // mock transaction
        mockManamer.transaction.mockImplementation(async (cb) =>
          cb(mockManamer),
        );
        userRepo.createTransactionRepo.mockReturnValue(userRepo);
        pointRepo.createTransactionRepo.mockReturnValue(pointRepo);

        // mock
        userRepo.getUserByPK.mockResolvedValue(userEntity);
        pointRepo.getPointByPk.mockResolvedValue(pointEntity);
        pointRepo.updatePointWithHistory.mockResolvedValue();

        const result = await service.chargeUserPoint(command);

        // when & then
        expect(result.amount).toBe(success);
      });
    });
  });

  describe('useUserPoint', () => {
    describe('실패한다.', () => {
      it('유저에게 포인트가 존재하지 않으면 사용에 실패한다.', async () => {
        // given
        const command = WriteUserPointCommand.from({
          userId: 1,
          amount: 100000,
        });
        const userEntity = MockEntityGenerator.generateUser({
          id: command.userId,
          pointId: null,
        });
        const success = RunTimeException;

        // mock transaction
        mockManamer.transaction.mockImplementation(async (cb) =>
          cb(mockManamer),
        );
        userRepo.createTransactionRepo.mockReturnValue(userRepo);
        pointRepo.createTransactionRepo.mockReturnValue(pointRepo);

        // mock
        userRepo.getUserByPK.mockResolvedValue(userEntity);
        pointRepo.getPointByPk.mockRejectedValue(new RunTimeException());

        // when & then
        await expect(service.useUserPoint(command)) //
          .rejects.toBeInstanceOf(success);
      });

      it('포인트가 잔액이 부족하면 않으면 사용에 실패한다.', async () => {
        // given
        const command = WriteUserPointCommand.from({
          userId: 1,
          amount: 100_000,
        });

        const userEntity = MockEntityGenerator.generateUser({
          id: command.userId,
          pointId: 1,
        });
        const pointEntity = MockEntityGenerator.generatePoint({
          id: userEntity.pointId,
          amount: 90_000,
        });
        const success = ConflictStatusException;

        // mock transaction
        mockManamer.transaction.mockImplementation(async (cb) =>
          cb(mockManamer),
        );
        userRepo.createTransactionRepo.mockReturnValue(userRepo);
        pointRepo.createTransactionRepo.mockReturnValue(pointRepo);

        // mock
        userRepo.getUserByPK.mockResolvedValue(userEntity);
        pointRepo.getPointByPk.mockResolvedValue(pointEntity);

        // when & then
        await expect(service.useUserPoint(command)) //
          .rejects.toBeInstanceOf(success);
      });
    });

    describe('성공한다.', () => {
      it('유저가 존재하고 유저가 포인트를 가지고 있으면 사용에 성공한다.', async () => {
        // given
        const pointId = 1;
        const command = WriteUserPointCommand.from({
          userId: 1,
          amount: 50_000,
        });
        const userEntity = MockEntityGenerator.generateUser({
          id: command.userId,
          pointId,
        });
        const pointEntity = MockEntityGenerator.generatePoint({
          id: pointId,
          amount: 100_000,
        });
        const success = pointEntity.amount - command.amount;

        // mock transaction
        mockManamer.transaction.mockImplementation(async (cb) =>
          cb(mockManamer),
        );
        userRepo.createTransactionRepo.mockReturnValue(userRepo);
        pointRepo.createTransactionRepo.mockReturnValue(pointRepo);

        // mock
        userRepo.getUserByPK.mockResolvedValue(userEntity);
        pointRepo.getPointByPk.mockResolvedValue(pointEntity);
        pointRepo.updatePointWithHistory.mockResolvedValue();

        const result = await service.useUserPoint(command)();

        // when & then
        expect(result.amount).toBe(success);
      });
    });
  });
});
