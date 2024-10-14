import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import 'reflect-metadata';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ConvertResponseInterceptor implements NestInterceptor {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const { statusCode } = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        return {
          statusCode,
          data,
          message: '성공',
        };
      }),
    );
  }
}
