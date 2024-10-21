import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import 'reflect-metadata';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ConvertResponseInterceptor implements NestInterceptor {
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
