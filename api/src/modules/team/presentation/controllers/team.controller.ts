import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  HttpCode, 
  HttpStatus, 
  Inject, 
  ConflictException, 
  NotFoundException, 
  ForbiddenException 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { TenantGuard } from '../../../auth/infrastructure/guards/tenant.guard';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import { CurrentTenant } from '../../../auth/presentation/decorators/current-tenant.decorator';
import { IUserRepositoryToken } from '../../../auth/domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../../auth/domain/repositories/user.repository.interface';
import { User } from '../../../auth/domain/entities/user.entity';
import { CreateTeamMemberDto } from '../dtos/create-team-member.dto';
import { UpdateTeamMemberDto } from '../dtos/update-team-member.dto';

@ApiTags('Equipe')
@Controller('team')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  required: true,
  description: 'ID da Concessionária (Tenant) ativa',
})
export class TeamController {
  constructor(
    @Inject(IUserRepositoryToken)
    private readonly userRepository: IUserRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar membros da equipe da concessionária' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Retorna a lista de membros.' })
  async list(@CurrentTenant() tenantId: string) {
    const members = await this.userRepository.findByTenantId(tenantId);
    return members.map(m => ({
      id: m.id,
      name: m.name,
      email: m.email,
      role: m.role,
      createdAt: m.createdAt,
    }));
  }

  @Post()
  @ApiOperation({ summary: 'Adicionar um novo membro à equipe' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Membro adicionado com sucesso.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'E-mail já está em uso.' })
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateTeamMemberDto,
  ) {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Este e-mail já está cadastrado no sistema.');
    }

    const userId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = new User(
      userId,
      dto.name,
      dto.email,
      passwordHash,
      tenantId,
      new Date(),
      new Date(),
      dto.role || 'vendedor',
    );

    const saved = await this.userRepository.create(user);
    return {
      id: saved.id,
      name: saved.name,
      email: saved.email,
      role: saved.role,
      createdAt: saved.createdAt,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar dados de um membro da equipe' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Membro atualizado com sucesso.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Membro não encontrado.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Não autorizado.' })
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTeamMemberDto,
  ) {
    const member = await this.userRepository.findById(id);
    if (!member) {
      throw new NotFoundException('Membro não encontrado.');
    }

    if (member.tenantId !== tenantId) {
      throw new ForbiddenException('Você não tem permissão para alterar membros de outra concessionária.');
    }

    if (dto.email && dto.email !== member.email) {
      const existing = await this.userRepository.findByEmail(dto.email);
      if (existing) {
        throw new ConflictException('Este e-mail já está em uso.');
      }
      member.email = dto.email;
    }

    if (dto.name !== undefined) member.name = dto.name;
    if (dto.role !== undefined) member.role = dto.role;
    
    if (dto.password) {
      member.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const saved = await this.userRepository.create(member);
    return {
      id: saved.id,
      name: saved.name,
      email: saved.email,
      role: saved.role,
      createdAt: saved.createdAt,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um membro da equipe' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Membro removido com sucesso.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Membro não encontrado.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Não é possível remover a si mesmo ou membro de outro tenant.' })
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser() currentUser: any,
    @Param('id') id: string,
  ) {
    if (currentUser.id === id) {
      throw new ForbiddenException('Você não pode remover a si mesmo da equipe.');
    }

    const member = await this.userRepository.findById(id);
    if (!member) {
      throw new NotFoundException('Membro não encontrado.');
    }

    if (member.tenantId !== tenantId) {
      throw new ForbiddenException('Você não tem permissão para remover membros de outra concessionária.');
    }

    await this.userRepository.delete(id);
  }
}
