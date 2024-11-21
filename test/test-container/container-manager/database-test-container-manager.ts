import { MySqlContainer, StartedMySqlContainer } from '@testcontainers/mysql';

/** 상수 값 개선 필요 */
export type DatabaseConnectionInfo = {
  DATABASE_HOST: 'localhost';
  DATABASE_PORT: number;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  /** 데이터베이스 name */
  DATABASE_NAME: string;
};

export class DatabaseTestContainerManager {
  private static instance: DatabaseTestContainerManager;
  private database?: StartedMySqlContainer;

  private constructor() {}

  static getInstance(): DatabaseTestContainerManager {
    if (!this.instance) {
      this.instance = new DatabaseTestContainerManager();
    }
    return this.instance;
  }

  async init(): Promise<DatabaseConnectionInfo> {
    this.database = await new MySqlContainer()
      .withReuse() // 컨테이너 재사용 설정
      .withCommand([
        '--character-set-server=utf8mb4',
        '--collation-server=utf8mb4_unicode_ci',
        '--innodb_buffer_pool_size=64M', // 메모리 사용량 최적화
        '--max_connections=30', // 테스트용 연결 수 제한
      ])
      .start();

    return {
      DATABASE_HOST: 'localhost',
      DATABASE_PORT: this.database.getPort(),
      DATABASE_NAME: this.database.getDatabase(),
      DATABASE_USER: this.database.getUsername(),
      DATABASE_PASSWORD: this.database.getUserPassword(),
    };
  }

  async cleanup(): Promise<void> {
    if (!this.database) {
      throw new Error(
        '[DatabaseTestContainerManager] 생성된 컨테이너가 없습니다.',
      );
    }

    // timeout을 주는 이유는 비동기적으로 정리되기 때문에 시간이 필요하다고 한다.
    await this.database.stop({
      timeout: 10_000,
      removeVolumes: true, // 볼륨도 함께 제거
    });

    this.database = undefined; // 참조 제거
  }
}
