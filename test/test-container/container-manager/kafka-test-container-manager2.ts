import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';

export type KafkaConnectionInfo = {
  KAFKA_HOST: string;
  KAFKA_PORT: number;
  KAFKA_BOOTSTRAP_SERVERS: string[];
};

export class KafkaTestContainerManager {
  private static instance: KafkaTestContainerManager;
  private container?: StartedTestContainer;

  private constructor() {}

  static getInstance(): KafkaTestContainerManager {
    if (!this.instance) {
      this.instance = new KafkaTestContainerManager();
    }
    return this.instance;
  }

  async init(): Promise<KafkaConnectionInfo> {
    this.container = await new GenericContainer('bitnami/kafka:3.8')
      .withExposedPorts(9094, 9094) // 클라이언트가 노출할 포트 지정, EXTERNAL과 일치해야한다.
      .withEnvironment({
        KAFKA_KRAFT_CLUSTER_ID: 'test-container-sXmGHyR1qVTyyl9XXr0g',
        KAFKA_CFG_PROCESS_ROLES: 'controller,broker',
        KAFKA_CFG_CONTROLLER_QUORUM_VOTERS: '0@localhost:9093',
        KAFKA_CFG_NODE_ID: '0',

        KAFKA_CFG_LISTENERS:
          'PLAINTEXT://:9092,CONTROLLER://:9093,EXTERNAL://:9094',

        // EXTERNAL을 통해 외부노출 설정
        KAFKA_CFG_ADVERTISED_LISTENERS:
          'PLAINTEXT://localhost:9092,EXTERNAL://localhost:9094',
        KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP:
          'PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT,EXTERNAL:PLAINTEXT',
        KAFKA_CFG_CONTROLLER_LISTENER_NAMES: 'CONTROLLER',
        KAFKA_CFG_INTER_BROKER_LISTENER_NAME: 'PLAINTEXT',

        /* 테스트 전용 셋팅 */
        // 테스트 환경 전용: 토픽 자동 생성 활성화
        KAFKA_CFG_AUTO_CREATE_TOPICS_ENABLE: 'true',
        KAFKA_CREATE_TOPICS: 'test-topic:1:1',

        /* 단일 브로커 전용 셋팅 */
        // 새로 생성되는 토픽의 기본 복제본 수를 1로 설정
        KAFKA_CFG_DEFAULT_REPLICATION_FACTOR: '1',
        // 새로 생성되는 토픽의 기본 파티션 수를 1로 설정
        KAFKA_CFG_NUM_PARTITIONS: '1',
        // 쓰기 작업이 성공으로 간주되기 위해 필요한 최소 동기화 복제본 수, 단일 브로커 '1'로 설정(원본만 유지)
        KAFKA_CFG_MIN_INSYNC_REPLICAS: '1',
        // 오프셋 토픽의 복제 팩터 설정, 단일 브로커 '1'로 설정(원본만 유지)
        KAFKA_CFG_OFFSETS_TOPIC_REPLICATION_FACTOR: '1',
        // 트랜잭션 상태를 저장하는 내부 토픽의 복제 팩터, 단일 브로커 '1'로 설정(원본만 유지)
        KAFKA_CFG_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: '1',
        // 트랜잭션 상태 로그에 대한 최소 동기화 복제본 수, 단일 브로커 '1'로 설정
        KAFKA_CFG_TRANSACTION_STATE_LOG_MIN_ISR: '1',
        KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: '1',
        KAFKA_MIN_INSYNC_REPLICAS: '1',

        // 로그
        // 로그 레벨 설정
        KAFKA_CFG_LOG4J_ROOT_LOGLEVEL: 'DEBUG',
        KAFKA_CFG_LOG4J_LOGGERS:
          'kafka.controller=DEBUG,kafka.producer.async.DefaultEventHandler=DEBUG,state.change.logger=DEBUG',

        // 상세 로깅 설정
        KAFKA_OPTS: '-Dlog4j.debug=true',
      })
      .withStartupTimeout(120000)
      // 브로커가 완전히 시작될 때까지 대기
      .withWaitStrategy(
        Wait.forLogMessage('Transitioning from STARTING to RECOVERY'),
      )
      .start();

    const managerHost = this.container.getHost();
    // 매핑된 랜덤 포트 확인 -> docker-compose ports: 9094:${랜덤포트}
    // const mappedPort = this.container.getMappedPort(9094);

    console.log(`[KafkaTestContainerManager#init] ${managerHost}:${9094}`);

    return {
      KAFKA_HOST: managerHost,
      KAFKA_PORT: 9094,
      KAFKA_BOOTSTRAP_SERVERS: [`${managerHost}:${9094}`],
    };
  }

  getContainer(): StartedTestContainer | undefined {
    return this.container;
  }

  async cleanup(): Promise<void> {
    if (!this.container) {
      throw new Error(
        '[KafkaTestContainerManager] 생성된 컨테이너가 없습니다.',
      );
    }

    await this.container.stop({
      timeout: 10_000,
      removeVolumes: true,
    });

    this.container = undefined;
  }
}
