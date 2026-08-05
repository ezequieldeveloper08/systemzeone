import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories(workspaceId: string) {
    return this.prisma.category.findMany({
      where: { workspaceId },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(workspaceId: string, name: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return this.prisma.category.create({
      data: {
        workspaceId,
        name,
        slug,
      },
    });
  }
}
