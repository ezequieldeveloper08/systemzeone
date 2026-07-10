import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LeadController } from './modules/lead/presentation/controllers/lead.controller';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const controller = app.get(LeadController);
  try {
    const res = await controller.createPublic(
      { 'x-tenant-id': 'ad73ed77-cb62-431f-996b-ed1ad042dca3' },
      {
        name: 'João Silva',
        email: 'joaosilva@gmail.com',
        phone: '11999999999',
        message: 'Olá, teste',
      }
    );
    console.log("Success controller:", res);
  } catch (err) {
    console.error("Error controller:", err);
  } finally {
    await app.close();
  }
}

run().catch(console.error);
