import { mock, MockProxy } from 'jest-mock-extended';
import {
  CreateQueueInfo,
  GetQueueInfo,
  QueueEntity,
  QueueRepository,
  QueueService,
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
    it('큐를 생성하고 CreateQueueInfo를 반환한다', async () => {
      // given
      const command = WriteQueueCommand.from({
        userId: 1,
        concertId: 1,
      });
      const queueEntity = MockEntityGenerator.generateQueue({
        id: 1,
        concertId: command.concertId,
      });
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
});
