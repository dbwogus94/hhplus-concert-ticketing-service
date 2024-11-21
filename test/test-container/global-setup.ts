import { exec } from 'child_process';
import { promisify } from 'util';
import {
  DatabaseConnectionInfo,
  DatabaseTestContainerManager,
} from './container-manager/database-test-container-manager';
import {
  RedisConnectionInfo,
  RedisTestContainerManager,
} from './container-manager';

// ISSUE: jest.config 절대경로 설정은 globalSetup과 따로 동작하기 떄문에 적용이 굉장히 까다롭다.

const execAsync = promisify(exec);

const setProcessEnv = (
  connectionInfo: DatabaseConnectionInfo & RedisConnectionInfo,
  // KafkaConnectionInfo,
): void => {
  const envConfig = {
    NODE_ENV: 'test',
    TEST_RUN: 'integration',
    ...connectionInfo,
  } as const;
  Object.assign(process.env, envConfig);
};

async function globalBefore(): Promise<void> {
  const dbManaber = DatabaseTestContainerManager.getInstance();
  const redisManaber = RedisTestContainerManager.getInstance();
  // const kafkaManager = KafkaTestContainerManager.getInstance();

  setProcessEnv({
    ...(await dbManaber.init()),
    ...(await redisManaber.init()),
  });

  try {
    await execAsync('npm run db:drop:test');
    await execAsync('npm run db:sync:test');
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export default globalBefore;
