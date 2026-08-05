import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { WorkspaceRole } from '@prisma/client';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async createOnboardingWorkspace(userId: string, dto: CreateWorkspaceDto) {
    const slug = (dto.slug || dto.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + `-${Math.floor(1000 + Math.random() * 9000)}`;

    const workspace = await this.prisma.workspace.create({
      data: {
        name: dto.name,
        slug,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: WorkspaceRole.OWNER,
          },
        },
      },
      include: {
        members: true,
      },
    });

    // Create Default Categories
    const defaultCategories = ['Eletrônicos', 'Informática', 'Ferramentas', 'Casa e Cozinha', 'Games'];
    for (const catName of defaultCategories) {
      await this.prisma.category.create({
        data: {
          workspaceId: workspace.id,
          name: catName,
          slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        },
      });
    }

    return workspace;
  }

  async getUserWorkspaces(userId: string) {
    return this.prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: true,
      },
    });
  }
}
