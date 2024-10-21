import { utilities, WinstonModuleOptions } from 'nest-winston';
import * as Winston from 'winston';

import { WinstonModuleOptionsStrategy } from './winston-module-options-strategy';

// 운영 환경 로그 옵션 전략
export class ProdWinstonOptionsStrategy extends WinstonModuleOptionsStrategy {
  constructor(appName: string) {
    super(appName);
  }

  override createWinstonModuleOptions(): WinstonModuleOptions {
    return {
      levels: this.logLevels,
      level: this.getNpmLogLevelName(this.logLevels.info),
      format: Winston.format.combine(
        Winston.format.timestamp(),
        Winston.format.ms(),
        utilities.format.nestLike(this.appName, {
          prettyPrint: true,
          /** colors: false => 색상 없음 */
          colors: false,
          appName: true,
        }),
      ),

      transports: [
        new Winston.transports.Console(),
        new Winston.transports.File({
          filename: 'logs/app.log',
          level: 'info',
        }),
        new Winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
      ],
    };
  }
}
