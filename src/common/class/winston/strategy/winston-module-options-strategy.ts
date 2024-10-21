import {
  WinstonModuleOptions,
  WinstonModuleOptionsFactory,
} from 'nest-winston';
import * as Winston from 'winston';

type NpmLogLevels = typeof Winston.config.npm.levels;

// 전략 인터페이스
export abstract class WinstonModuleOptionsStrategy
  implements WinstonModuleOptionsFactory
{
  readonly logLevels: NpmLogLevels = Winston.config.npm.levels;

  constructor(readonly appName: string) {}

  createWinstonModuleOptions(): WinstonModuleOptions {
    throw new Error(
      '추상 클래스에서 사용이 불가능한 메서드 입니다. 자식 클래스를 통해 호출해주세요.',
    );
  }

  protected getNpmLogLevelName(level: number): string {
    const reverseLevelsKeyValue: Record<string, string> = Object.fromEntries(
      Object.entries(this.logLevels).reduce(
        (acc, [key, value]) => acc.set(value.toString(), key),
        new Map(),
      ),
    );
    const logLevelName = reverseLevelsKeyValue[level];
    if (!logLevelName) {
      throw new Error(`일치하는 Npm 로그 레벨이 존재하지 않습니다.`);
    }
    return logLevelName;
  }
}
