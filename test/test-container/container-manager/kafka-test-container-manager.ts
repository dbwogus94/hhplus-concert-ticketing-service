import { KafkaContainer, StartedKafkaContainer } from '@testcontainers/kafka';

export type KafkaConnectionInfo = {
  KAFKA_HOST: string;
  KAFKA_PORT: number;
  KAFKA_BOOTSTRAP_SERVERS: string[];
};

export class KafkaTestContainerManager {
  private static instance: KafkaTestContainerManager;
  private container?: StartedKafkaContainer;

  private constructor() {}

  static getInstance(): KafkaTestContainerManager {
    if (!this.instance) {
      this.instance = new KafkaTestContainerManager();
    }
    return this.instance;
  }

  async init(): Promise<KafkaConnectionInfo> {
    this.container = await new KafkaContainer('confluentinc/cp-kafka:7.5.0')
      .withKraft()
      .withEnvironment({
        KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: '1',
        KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'true',
      })
      .withExposedPorts(9094, 9094)
      .withStartupTimeout(120000)
      .start();

    const managerHost = this.container.getHost();
    // const mappedPort = this.container.getMappedPort(9094);

    console.error(`[KafkaTestContainerManager#init] ${managerHost}:${9094}`);

    return {
      KAFKA_HOST: managerHost,
      KAFKA_PORT: 9094,
      KAFKA_BOOTSTRAP_SERVERS: [`${managerHost}:${9094}`],
    };
  }

  getContainer(): StartedKafkaContainer | undefined {
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
