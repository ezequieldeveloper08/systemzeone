import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublications(workspaceId: string) {
    return this.prisma.socialPublication.findMany({
      where: { workspaceId },
      include: {
        savedOffer: {
          include: {
            marketplaceOffer: {
              include: {
                catalogProduct: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
