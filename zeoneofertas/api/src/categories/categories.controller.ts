import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getCategories(@Headers('x-workspace-id') workspaceId: string) {
    return this.categoriesService.getCategories(workspaceId || 'demo-workspace-01');
  }

  @Post()
  async createCategory(@Headers('x-workspace-id') workspaceId: string, @Body('name') name: string) {
    return this.categoriesService.createCategory(workspaceId || 'demo-workspace-01', name);
  }
}
