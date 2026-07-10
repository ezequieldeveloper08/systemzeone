import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TenantModule } from '../tenant/tenant.module';
import { UserOrmEntity } from './infrastructure/database/user.orm-entity';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { IUserRepositoryToken } from './domain/repositories/user.repository.interface';
import { JwtStrategy } from './infrastructure/guards/jwt.strategy';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { AuthController } from './presentation/controllers/auth.controller';

@Module({
  imports: [
    TenantModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'capri_secret_jwt_key_2026',
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forFeature([UserOrmEntity]),
  ],
  providers: [
    {
      provide: IUserRepositoryToken,
      useClass: UserRepository,
    },
    JwtStrategy,
    RegisterUserUseCase,
    LoginUserUseCase,
  ],
  controllers: [AuthController],
  exports: [IUserRepositoryToken, JwtStrategy, PassportModule],
})
export class AuthModule {}
