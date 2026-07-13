import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';

const server = express();
let nestApp: any;

async function bootstrap() {
  if (!nestApp) {
    nestApp = await NestFactory.create(AppModule, new ExpressAdapter(server));

    // 1. Enable Global Validation
    nestApp.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    // 2. Enable CORS
    nestApp.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    // 2.5. Serve Static Assets for uploaded images
    nestApp.use('/uploads', express.static(join(process.cwd(), 'uploads'), {
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

    const document = SwaggerModule.createDocument(nestApp, config);
    SwaggerModule.setup('api/docs', nestApp, document);

    await nestApp.init();
  }
  return server;
}

// Para rodar localmente no npm run start:dev
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const port = process.env.PORT || 3001;
  NestFactory.create(AppModule).then(async (app) => {
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });
    app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
    await app.listen(port);
    console.log(`🚀 API is running on: http://localhost:${port}`);
    console.log(`📚 Swagger documentation is available at: http://localhost:${port}/api/docs`);
  });
}

// Export para a Vercel
export default async (req: any, res: any) => {
  const appServer = await bootstrap();
  appServer(req, res);
};
