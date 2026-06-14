import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Larger body limit for markdown payloads (file uploads use multipart separately)
  app.use(json({ limit: '12mb' }));
  app.use(urlencoded({ extended: true, limit: '12mb' }));
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // Same-origin in prod (nginx); explicit origin + credentials for local-dev cookies.
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3200',
    credentials: true,
  });

  // Serve uploaded media at /uploads (bypasses the /api global prefix).
  // In production nginx serves this directly from disk; this covers local dev.
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' });

  app.setGlobalPrefix('api');

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('rezwoan.me Portfolio API')
      .setDescription('Public content + admin CMS + AI features')
      .setVersion('2.0')
      .addCookieAuth('access_token')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = Number(process.env.PORT) || 3201;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API on http://localhost:${port}/api`);
}

bootstrap();
