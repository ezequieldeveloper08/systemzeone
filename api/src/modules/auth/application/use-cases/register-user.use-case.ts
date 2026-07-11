import { Inject, Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { IUserRepositoryToken } from '../../domain/repositories/user.repository.interface';
import { ITenantRepositoryToken } from '../../../tenant/domain/repositories/tenant.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import type { ITenantRepository } from '../../../tenant/domain/repositories/tenant.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { Tenant } from '../../../tenant/domain/entities/tenant.entity';
import { RegisterDto } from '../../presentation/dtos/register.dto';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(IUserRepositoryToken)
    private readonly userRepository: IUserRepository,
    @Inject(ITenantRepositoryToken)
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(dto: RegisterDto): Promise<{ user: User; tenant: Tenant }> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Usuário com este e-mail já existe.');
    }

    // 1. Create Tenant
    const tenantId = crypto.randomUUID();
    const tenant = new Tenant(
      tenantId,
      dto.tenantName,
      dto.businessType || 'crm_only',
      new Date(),
      new Date(),
    );
    const createdTenant = await this.tenantRepository.create(tenant);

    // 2. Create User linked to Tenant
    const userId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = new User(
      userId,
      dto.name,
      dto.email,
      passwordHash,
      createdTenant.id,
      new Date(),
      new Date(),
      'administrador',
    );
    const createdUser = await this.userRepository.create(user);

    return { user: createdUser, tenant: createdTenant };
  }
}
