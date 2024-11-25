import { Kafka, Producer, Consumer, Partitioners } from 'kafkajs';
import {
  KafkaConnectionInfo,
  KafkaTestContainerManager,
} from './container-manager/kafka-test-container-manager';

describe('Kafka Integration Tests', () => {
  let kafkaManager: KafkaTestContainerManager;
  let connectionInfo: KafkaConnectionInfo;
  let kafka: Kafka;
  let producer: Producer;
  let consumer: Consumer;

  const TEST_TOPIC = 'test-topic';
  const TEST_GROUPID = 'test-group';

  // Jest 타임아웃 증가
  jest.setTimeout(120000);

  beforeAll(async () => {
    // Kafka 테스트 컨테이너 시작
    kafkaManager = KafkaTestContainerManager.getInstance();
    connectionInfo = await kafkaManager.init();

    // KafkaJS 클라이언트 초기화
    kafka = new Kafka({
      // logLevel: logLevel.DEBUG,
      clientId: 'test-client',
      // brokers: ['localhost:9094'],
      brokers: connectionInfo.KAFKA_BOOTSTRAP_SERVERS, // ['localhost:${port}'],
      retry: {
        initialRetryTime: 1000,
        retries: 3,
        maxRetryTime: 5000,
      },
      // connectionTimeout: 3000,
    });

    // 연결 초기화
    producer = kafka.producer({
      // 기본 파티션 설정
      createPartitioner: Partitioners.DefaultPartitioner,
    });

    consumer = kafka.consumer({
      groupId: TEST_GROUPID,
    });

    await producer.connect();
    await consumer.connect();
  });

  afterAll(async () => {
    try {
      await producer?.disconnect();
      await consumer?.disconnect();
      await kafkaManager?.cleanup();
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  test.skip('프로듀서 연결 확인', async () => {
    try {
      await producer.connect();
      expect(producer).toBeDefined();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  test.skip('컨슈머 연결 확인', async () => {
    await consumer.connect();
    expect(consumer).toBeDefined();
  });

  test('메시지 프로듀싱 테스트', async () => {
    const message = {
      key: 'test-key',
      partition: 0,
      value: JSON.stringify({ hello: 'world' }),
    };

    const sendResult = await producer
      .send({
        topic: TEST_TOPIC,
        messages: [message],
      })
      .catch(console.error);

    // 브로커가 토픽을 인식할 시간 제공
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      // /opt/bitnami/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9094 --list
      const sendResult = await producer.send({
        topic: TEST_TOPIC,
        messages: [message],
      });

      expect(sendResult).toBeDefined();
      expect(sendResult[0].errorCode).toBe(0);
    } catch (error) {
      console.error(error);
      throw error;
    }
  });

  test('메시지 컨슈밍 테스트', async () => {
    const subscribeMessages: any[] = [];

    await consumer.subscribe({ topic: TEST_TOPIC, fromBeginning: true });
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        subscribeMessages.push({
          topic,
          partition,
          key: message.key?.toString(),
          value: message.value?.toString(),
        });
      },
    });

    // 프로듀서로 테스트 메시지 전송
    const testMessage = {
      key: 'test-key-2',
      value: JSON.stringify({ test: 'message' }),
    };

    await producer.send({
      topic: TEST_TOPIC,
      messages: [testMessage],
    });

    // 메시지 수신 대기
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 검증
    expect(subscribeMessages.length).toBeGreaterThan(0);

    const lastMessage = subscribeMessages.at(-1);
    expect(lastMessage.key).toBe('test-key-2');
    expect(JSON.parse(lastMessage.value)).toEqual({ test: 'message' });
  });
});
