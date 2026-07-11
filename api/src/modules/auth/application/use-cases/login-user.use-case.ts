import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IUserRepositoryToken } from '../../domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { ITenantRepositoryToken } from '../../../tenant/domain/repositories/tenant.repository.interface';
import type { ITenantRepository } from '../../../tenant/domain/repositories/tenant.repository.interface';
import { LoginDto } from '../../presentation/dtos/login.dto';
import { User } from '../../domain/entities/user.entity';
import { Tenant } from '../../../tenant/domain/entities/tenant.entity';

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(IUserRepositoryToken)
    private readonly userRepository: IUserRepository,
    @Inject(ITenantRepositoryToken)
    private readonly tenantRepository: ITenantRepository,
    private readonly jwtService: JwtService,
  ) { }

  async execute(dto: LoginDto): Promise<{ accessToken: string; user: Omit<User, 'passwordHash'>; tenant: Tenant | null }> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
    };

    const accessToken = this.jwtService.sign(payload);

    const { passwordHash, ...userWithoutPassword } = user;

    const tenant = await this.tenantRepository.findById(user.tenantId);

    return {
      accessToken,
      user: userWithoutPassword,
      tenant,
    };
  }
}
