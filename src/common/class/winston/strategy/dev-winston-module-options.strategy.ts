import * as Winston from 'winston';
import { utilities, WinstonModuleOptions } from 'nest-winston';

import { WinstonModuleOptionsStrategy } from './winston-module-options-strategy';

// 개발 환경 로그 옵션 전략
export class DevWinstonOptionsStrategy extends WinstonModuleOptionsStrategy {
  constructor(appName: string) {
    super(appName);
  }

  override createWinstonModuleOptions(): WinstonModuleOptions {
    return {
      /* 커스텀 레벨 목록 설정 */
      levels: this.logLevels,
      /* 설정한 로그 레벨 이하만 출력 */
      level: this.getNpmLogLevelName(this.logLevels.debug),
      /* 출력 포멧 설정 */
      format: Winston.format.combine(
        Winston.format.timestamp(),
        Winston.format.ms(), // 이전 로그와 다음로그 시간차 출력

        // nest-winston에서 제공하는 utilities는 nestjs의 logger에 연동하기 위해 사용된다.
        utilities.format.nestLike(this.appName, {
          prettyPrint: true,
          /** colors: false => 색상 없음 */
          colors: true, //
          appName: true,
        }),
      ),
      /* 생성한 로그를 어디에 출력(전송)할지 설정 */
      transports: [new Winston.transports.Console()],
    };
  }
}
