import { HttpException, NotFoundException } from '@nestjs/common';
import { ApplicationException } from './application.exception';
import { ApplicationExceptionCode } from './exception-type';

export class ResourceNotFoundException extends ApplicationException {
  constructor(message?: string) {
    super(ApplicationExceptionCode.RESOURCE_NOT_FOUND);
    this.message = message;
  }

  toHttpException(): HttpException {
    return new NotFoundException(this.message);
  }
}
