import { Controller, Post, Body } from '@nestjs/common';
import { GeminiService, GenerateCopyDto } from './gemini.service';

@Controller('generator')
export class GeneratorController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('gemini-copy')
  async generateGeminiCopy(@Body() dto: GenerateCopyDto) {
    return this.geminiService.generateCopy(dto);
  }
}
