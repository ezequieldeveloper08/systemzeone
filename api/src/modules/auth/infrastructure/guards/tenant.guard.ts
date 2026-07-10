import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      throw new ForbiddenException('Usuário não autenticado.');
    }

    const tenantIdHeader = request.headers['x-tenant-id'];

    if (!tenantIdHeader) {
      throw new ForbiddenException('O cabeçalho x-tenant-id é obrigatório.');
    }

    if (user.tenantId !== tenantIdHeader) {
      throw new ForbiddenException('Este usuário não tem permissão para acessar este Tenant.');
    }

    // Attach tenantId to the request context for easy retrieval
    request.tenantId = user.tenantId;

    return true;
  }
}
