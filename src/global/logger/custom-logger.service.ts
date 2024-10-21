import {
  Inject,
  Injectable,
  Logger,
  LoggerService,
  Scope,
} from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLoggerService implements LoggerService {
  private target: string;

  constructor(
    @Inject(Logger)
    private readonly logger: LoggerService,
  ) {
    this.setTarget(this.constructor.name);
  }

  setTarget(target: string) {
    this.target = target;
  }

  log(message: unknown) {
    const input =
      typeof message === 'string' || typeof message === 'number'
        ? message
        : JSON.stringify(message);
    this.logger.log(input, [this.target]);
  }

  debug(message: unknown) {
    const input =
      typeof message === 'string' || typeof message === 'number'
        ? message
        : JSON.stringify(message);
    this.logger.debug(input, [this.target]);
  }

  warn(message: unknown) {
    const input =
      typeof message === 'string' || typeof message === 'number'
        ? message
        : JSON.stringify(message);
    this.logger.warn(input, [this.target]);
  }

  verbose(message: unknown) {
    const input =
      typeof message === 'string' || typeof message === 'number'
        ? message
        : JSON.stringify(message);
    this.logger.verbose(input, [this.target]);
  }

  error(error: Error | string) {
    this.logger.error(
      error,
      error instanceof Error && error.stack ? error.stack : void 0,
      this.target,
    );
  }
}
