import { BadRequestException, HttpException } from '@nestjs/common';
import { ApplicationException } from './application.exception';
import { ApplicationExceptionCode } from './exception-type';

export class InvalidParameterException extends ApplicationException {
  constructor(message?: string) {
    super(ApplicationExceptionCode.INVALID_PARAMETER);
    this.message = message;
  }

  toHttpException(): HttpException {
    throw new BadRequestException(this.message);
  }
}
