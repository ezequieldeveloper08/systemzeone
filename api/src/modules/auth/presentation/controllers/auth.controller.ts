import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../../application/use-cases/login-user.use-case';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { TenantGuard } from '../../infrastructure/guards/tenant.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CurrentTenant } from '../decorators/current-tenant.decorator';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário e concessionária (Tenant)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Usuário registrado com sucesso.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Usuário já cadastrado.' })
  async register(@Body() dto: RegisterDto) {
    const result = await this.registerUserUseCase.execute(dto);
    return {
      message: 'Usuário e concessionária registrados com sucesso.',
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        tenantId: result.user.tenantId,
      },
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
      },
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar usuário e obter token JWT' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Autenticação bem sucedida.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Credenciais inválidas.' })
  async login(@Body() dto: LoginDto) {
    return this.loginUserUseCase.execute(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter perfil do usuário logado' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Retorna os dados do usuário autenticado.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Não autorizado.' })
  async getMe(@CurrentUser() user: any) {
    return user;
  }

  @Get('tenant-protected-test')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'x-tenant-id',
    required: true,
    description: 'ID da Concessionária (Tenant) ativa do usuário',
  })
  @ApiOperation({ summary: 'Endpoint de teste protegido por Tenant e Token' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Acesso permitido.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Tenant não condiz com o usuário.' })
  async testTenantProtected(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return {
      message: 'Você acessou com sucesso este recurso isolado!',
      tenantId,
      userId: user.id,
    };
  }
}
