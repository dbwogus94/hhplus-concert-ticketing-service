import { ConflictException, HttpException } from '@nestjs/common';
import { ApplicationException } from './application.exception';
import { ApplicationExceptionCode } from './exception-type';

export class ConflictStatusException extends ApplicationException {
  constructor(message?: string) {
    super(ApplicationExceptionCode.CONFLICT_STATUS);
    this.message = message;
  }

  toHttpException(): HttpException {
    throw new ConflictException(this.message);
  }
}
