import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { SERVICE_ACCESS_TOKEN } from './common';

async function bootstrap() {
  const app = await NestFactory.create<INestApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  setupSwagger(app);
  await app.listen(3000);
}
bootstrap();

function setupSwagger(app: INestApplication) {
  const documentBuilder = new DocumentBuilder()
    .setTitle('콘서트 예메 API')
    .setDescription('콘서트 예메 API')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Access JWT',
        description: 'Enter Access Token',
        in: 'header',
      },
      SERVICE_ACCESS_TOKEN,
    )
    .setVersion('1.0.0');
  const swaggerConfig = documentBuilder.build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/docs', app, document);
}
