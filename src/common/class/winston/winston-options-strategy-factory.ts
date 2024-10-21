import {
  DevWinstonOptionsStrategy,
  ProdWinstonOptionsStrategy,
  WinstonModuleOptionsStrategy,
} from './strategy';

type Env = 'prod' | 'dev' | 'production' | 'development';
type Param = {
  env: Env;
  appName: string;
};

export class WinstonOptionsStrategyFactory {
  static create(param: Param): WinstonModuleOptionsStrategy {
    const { env, appName } = param;
    switch (env.toLowerCase()) {
      case 'production':
      case 'prod':
        return new ProdWinstonOptionsStrategy(appName);
      case 'development':
      case 'dev':
      default:
        return new DevWinstonOptionsStrategy(appName);
    }
  }
}
