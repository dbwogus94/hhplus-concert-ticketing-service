import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';

export type RedisConnectionInfo = {
  REDIS_HOST: 'localhost';
  REDIS_PORT: number;
};

export class RedisTestContainerManager {
  private static instance: RedisTestContainerManager;
  private container?: StartedRedisContainer;

  private constructor() {}

  static getInstance(): RedisTestContainerManager {
    if (!this.instance) {
      this.instance = new RedisTestContainerManager();
    }
    return this.instance;
  }

  async init(): Promise<RedisConnectionInfo> {
    this.container = await new RedisContainer()
      .withReuse() // 컨테이너 재사용 설정
      .withExposedPorts(6379)
      .withStartupTimeout(120000) // 2분 타임아웃
      .start();

    return {
      REDIS_HOST: 'localhost',
      REDIS_PORT: this.container.getMappedPort(6379),
    };
  }

  getContainer(): StartedRedisContainer | undefined {
    return this.container;
  }

  async cleanup(): Promise<void> {
    if (!this.container) {
      throw new Error(
        '[RedisTestContainerManager] 생성된 컨테이너가 없습니다.',
      );
    }

    await this.container.stop({
      timeout: 10_000,
      removeVolumes: true,
    });

    this.container = undefined;
  }
}
