import { Logger } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export function httpLogger(logger: Logger) {
  const NANO = 1000000;

  return (request: Request, response: Response, next: NextFunction) => {
    const hrtimeStart = process.hrtime();

    response.on('finish', () => {
      const { method, originalUrl } = request;
      const { statusCode } = response;
      const httpVersion = 'HTTP/' + request.httpVersion;

      const [, nanoseconds] = process.hrtime(hrtimeStart);
      const responseMsTime = (nanoseconds / NANO).toFixed(3);

      const message = `[Http] ${method} ${originalUrl} ${httpVersion} ${statusCode} ${responseMsTime}ms `;
      if (statusCode >= 500) return logger.error(message);
      if (statusCode >= 400) return logger.warn(message);
      return logger.debug(message);
    });
    next();
  };
}
