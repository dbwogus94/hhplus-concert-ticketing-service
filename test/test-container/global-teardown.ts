import { RedisTestContainerManager } from './container-manager';
import { DatabaseTestContainerManager } from './container-manager/database-test-container-manager';

export default async () => {
  await DatabaseTestContainerManager.getInstance().cleanup();
  await RedisTestContainerManager.getInstance().cleanup();
};
