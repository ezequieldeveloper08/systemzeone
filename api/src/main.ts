import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Enable Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // 2. Enable CORS
  app.enableCors({
    origin: '*', // Customize this for production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 2.5. Serve Static Assets for uploaded images
  app.use('/uploads', express.static(join(process.cwd(), 'uploads'), {
    setHeaders: (res, path) => {
      if (path.endsWith('.ogg')) {
        res.setHeader('Content-Type', 'audio/ogg');
      } else if (path.endsWith('.mp3')) {
        res.setHeader('Content-Type', 'audio/mpeg');
      } else if (path.endsWith('.wav')) {
        res.setHeader('Content-Type', 'audio/wav');
      }
    }
  }));

  // 3. Configure Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Capri Veículos - API Multitenant')
    .setDescription('Serviços de autenticação, catálogo e leads isolados por concessionária.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 API is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation is available at: http://localhost:${port}/api/docs`);
}
bootstrap();
// Trigger reload
