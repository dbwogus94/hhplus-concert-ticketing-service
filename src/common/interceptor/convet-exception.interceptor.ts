import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import 'reflect-metadata';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CustomLoggerService } from 'src/global';
import { ApplicationException } from '../exception';

/** 예외를 HttpException으로 변환 역할을 수행하는 인터셉터  */
@Injectable()
export class ConvertExceptionInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLoggerService) {
    this.logger.setTarget(this.constructor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) =>
        throwError(() => {
          if (err instanceof HttpException) {
            return err;
          } else if (err instanceof ApplicationException) {
            return err.toHttpException();
          } else {
            this.logger.error(err);
            return new InternalServerErrorException();
          }
        }),
      ),
    );
  }
}
