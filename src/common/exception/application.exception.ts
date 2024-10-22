import { HttpException } from '@nestjs/common';
import {
  ApplicationExceptionCode,
  ApplicationExceptionRecord,
} from './exception-type';

export abstract class ApplicationException extends Error {
  /** 에러 메시지 */
  message: string;

  constructor(readonly code: ApplicationExceptionCode) {
    super();
    Error.captureStackTrace(this);

    const { message } = ApplicationExceptionRecord[this.code];
    this.message = message;
  }

  abstract toHttpException(): HttpException;
}
