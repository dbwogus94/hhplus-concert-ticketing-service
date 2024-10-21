import { LoggerService } from '@nestjs/common';
import { WinstonModule, WinstonModuleOptions } from 'nest-winston';
import { WinstonModuleOptionsStrategy } from './strategy/winston-module-options-strategy';

/** `@nestjs/common`의 LoggerService를 생성하는 빌더 클래스  */
export class WinstonLoggerServiceBuiler {
  #winstonModuleOptions: WinstonModuleOptions;

  private constructor() {}

  static create() {
    return new this();
  }

  setWinstonModuleOptions(
    options: WinstonModuleOptions | WinstonModuleOptionsStrategy,
  ) {
    if (options instanceof WinstonModuleOptionsStrategy) {
      this.#winstonModuleOptions = options.createWinstonModuleOptions();
    } else {
      this.#winstonModuleOptions = options;
    }
    return this;
  }

  build(): LoggerService {
    if (!this.#winstonModuleOptions)
      throw new Error(
        'WinstonModuleOptions가 설정되지 않았습니다. build() 메서드를 호출하기 전에 setWinstonModuleOptions()를 사용하여 옵션을 설정해주세요.',
      );

    return WinstonModule.createLogger(this.#winstonModuleOptions);
  }
}
