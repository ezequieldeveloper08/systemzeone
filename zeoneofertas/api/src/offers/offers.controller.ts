import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { OffersService, SaveOfferDto } from './offers.service';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  async getOffers(@Headers('x-workspace-id') workspaceId: string) {
    return this.offersService.getSavedOffers(workspaceId);
  }

  @Post('save')
  async saveOffer(@Headers('x-workspace-id') workspaceId: string, @Body() dto: SaveOfferDto) {
    return this.offersService.saveOffer({ ...dto, workspaceId });
  }
}
