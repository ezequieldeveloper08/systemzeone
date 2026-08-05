import { Controller, Get, Headers } from '@nestjs/common';
import { PublicationsService } from './publications.service';

@Controller('publications')
export class PublicationsController {
  constructor(private readonly publicationsService: PublicationsService) {}

  @Get()
  async getPublications(@Headers('x-workspace-id') workspaceId: string) {
    return this.publicationsService.getPublications(workspaceId || 'demo-workspace-01');
  }
}
