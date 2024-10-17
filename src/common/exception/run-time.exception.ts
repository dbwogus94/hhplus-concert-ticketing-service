import { ApplicationException } from './application.exception';
import { ApplicationExceptionCode } from './exception-type';

export class RunTimeException extends ApplicationException {
  constructor(message?: string) {
    super(ApplicationExceptionCode.RUNTIME_ERROR);
    this.message = message;
  }
}
