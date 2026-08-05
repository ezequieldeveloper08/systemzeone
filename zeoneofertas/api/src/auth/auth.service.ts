import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.profile.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new BadRequestException('E-mail já cadastrado na plataforma');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const profile = await this.prisma.profile.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash,
      },
    });

    const token = this.jwtService.sign({
      sub: profile.id,
      email: profile.email,
      name: profile.name,
    });

    return {
      user: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
      },
      accessToken: token,
    };
  }

  async login(dto: LoginDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!profile) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isMatch = await bcrypt.compare(dto.password, profile.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const token = this.jwtService.sign({
      sub: profile.id,
      email: profile.email,
      name: profile.name,
    });

    return {
      user: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
      },
      accessToken: token,
    };
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        memberships: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!profile) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return profile;
  }
}
