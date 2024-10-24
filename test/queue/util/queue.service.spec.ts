import { mock, MockProxy } from 'jest-mock-extended';
import {
  CreateQueueInfo,
  GetQueueInfo,
  QueueEntity,
  QueueRepository,
  QueueService,
  QueueStatus,
  WriteQueueCommand,
} from 'src/domain/queue';
import { MockEntityGenerator } from 'test/fixture';

describe('QueueService', () => {
  let queueRepo: MockProxy<QueueRepository>;
  let service: QueueService;

  beforeEach(() => {
    queueRepo = mock<QueueRepository>();
    service = new QueueService(queueRepo);
  });

  describe('createQueue', () => {
    it('큐를 대기 상태로, CreateQueueInfo를 반환한다', async () => {
      // given
      const command = WriteQueueCommand.from({
        userId: 1,
        concertId: 1,
      });
      const queueEntity = MockEntityGenerator.generateQueue({
        id: 1,
        concertId: command.concertId,
      });
      queueEntity.status = QueueStatus.WAIT;

      const success = CreateQueueInfo.of(queueEntity);

      // mock
      queueRepo.saveQueue.mockResolvedValue(queueEntity);

      // when
      const result = await service.createQueue(command);

      // then
      expect(result).toEqual(success);
    });
  });

  describe('getQueue', () => {
    it('큐 정보와 대기번호를 조회하고 반환한다', async () => {
      // given
      const queueUid = QueueEntity.generateUUIDv4();
      const queueEntity = MockEntityGenerator.generateQueue({
        id: 1,
        uid: queueUid,
        userId: 1,
        concertId: 1,
      });
      const waitingNumber = 3;
      const success = GetQueueInfo.of({
        ...queueEntity,
        waitingNumber,
      });

      // mock
      queueRepo.getQueueByUid.mockResolvedValue(queueEntity);
      queueRepo.getWaitingNumber.mockResolvedValue(waitingNumber);

      // when
      const result = await service.getQueue(queueUid);

      // then
      expect(queueRepo.getQueueByUid).toHaveBeenCalledWith(queueUid);
      expect(queueRepo.getWaitingNumber).toHaveBeenCalledWith(queueEntity);
      expect(result).toEqual(success);
    });
  });

  describe('batchQueueActiveStatus', () => {
    it('대기 중인 큐를 지정된 개수만큼 활성 상태로 변경한다', async () => {
      // given
      const waitingQueues = Array.from({ length: 10 }, (_, i) => {
        return MockEntityGenerator.generateQueue({
          id: i + 1,
          concertId: 1,
        });
      });
      const queueUids = waitingQueues.map((q) => q.uid);
      const activeCount = 3;

      // mock
      queueRepo.getQueues.mockResolvedValue(waitingQueues);
      queueRepo.updateQueues.mockResolvedValue();

      // when
      await service.batchQueueActiveStatus(activeCount);

      // then
      expect(queueRepo.getQueues).toHaveBeenCalledWith({
        where: { status: QueueStatus.WAIT },
        order: { id: 'ASC' },
        take: activeCount,
      });

      expect(queueRepo.updateQueues).toHaveBeenCalledWith(queueUids, {
        status: QueueStatus.ACTIVE,
        activedAt: new Date(),
      });
    });

    it('대기 중인 큐가 없으면 업데이트하지 않는다', async () => {
      // given
      const activeCount = 3;
      const emptyWaitingQueues: QueueEntity[] = [];

      // mock
      queueRepo.getQueues.mockResolvedValue(emptyWaitingQueues);
      // queueRepo.updateQueues.mockResolvedValue();

      // when
      await service.batchQueueActiveStatus(activeCount);

      // then
      expect(queueRepo.getQueues).toHaveBeenCalledWith({
        where: { status: QueueStatus.WAIT },
        order: { id: 'ASC' },
        take: activeCount,
      });

      expect(queueRepo.updateQueues).not.toHaveBeenCalled();
    });
  });

  describe('changeAllExpireStatus', () => {
    it('현재 시간 기준 사용시간이 지난 활성 상태의 큐를 모두 만료 상태로 변경한다.', async () => {
      // given
      const now = new Date();

      // mock
      queueRepo.updateAllExpireQueues.mockResolvedValue();

      // when
      await service.changeAllExpireStatus(now);

      // then
      expect(queueRepo.updateAllExpireQueues).toHaveBeenCalledWith(now);
    });
  });
});
