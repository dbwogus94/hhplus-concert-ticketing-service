import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import {
  SERVICE_ACCESS_TOKEN,
  WinstonLoggerServiceBuiler,
  WinstonOptionsStrategyFactory,
} from './common';
import { AppModule } from './app.module';
import { httpLogger } from './common/middleware/http-logger.middleware';

const DEFALUT_APP_NAME = 'hhplus-concert';

async function bootstrap() {
  // Note: 환경변수에 따른 로그 전략 객체 인스턴스 생성
  const appName = process.env.APP_NAME ?? DEFALUT_APP_NAME;
  const nodeEnv = (process.env.NODE_ENV as any) ?? 'local';
  const strategy = WinstonOptionsStrategyFactory.create({
    appName,
    env: nodeEnv,
  });

  // Note: 전역에서 사용하는 Nestjs의 Logger를 WinstonLogger로 변경한다.
  const app = await NestFactory.create<INestApplication>(AppModule, {
    logger: WinstonLoggerServiceBuiler.create()
      .setWinstonModuleOptions(strategy)
      .build(),
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.use(httpLogger(app.get(Logger)));
  setupSwagger(app);

  await app.listen(3000);
}
bootstrap();

function setupSwagger(app: INestApplication) {
  const documentBuilder = new DocumentBuilder()
    .setTitle('콘서트 예메 API')
    .setDescription('콘서트 예메 API')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-queue-token',
        in: 'header',
        description: 'Authentication token',
      },
      SERVICE_ACCESS_TOKEN,
    )
    .setVersion('1.0.0');
  const swaggerConfig = documentBuilder.build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/docs', app, document);
}
