import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeneratorController } from './generator.controller';

@Module({
  controllers: [GeneratorController],
  providers: [GeminiService],
  exports: [GeminiService],
})
export class GeneratorModule {}
