# Specification 03: Autenticação JWT, Gestão de Workspace e Onboarding (API NestJS)

> **Projeto**: OfertaHub (zeoneofertas)  
> **Versão**: 2.0 (Atualizado para NestJS + JWT + MySQL)  
> **Status**: Aprovado  

---

## 1. Visão Geral

Esta especificação define a arquitetura de autenticação via **JWT (JSON Web Tokens)** na API NestJS, utilizando o banco de dados MySQL 8.0, o fluxo de workspaces multi-tenant e o Wizard de Onboarding.

---

## 2. Autenticação via API NestJS

### 2.1. Endpoints de Auth na API (`/auth/*`)
- `POST /auth/register`: Cadastro de usuário. Cria o registro na tabela `profiles` com hash `bcrypt`.
- `POST /auth/login`: Autenticação por e-mail e senha. Retorna o `access_token` JWT.
- `GET /auth/me`: Retorna o perfil do usuário autenticado a partir do token.
- `POST /auth/forgot-password`: Gera token temporário de redefinição de senha.
- `POST /auth/reset-password`: Redefine a senha no MySQL.

### 2.2. Payload do JWT
```json
{
  "sub": "uuid-do-usuario",
  "email": "usuario@exemplo.com",
  "name": "Nome do Usuário",
  "iat": 1700000000,
  "exp": 1700086400
}
```

---

## 3. Fluxo de Onboarding (`/onboarding`)

Após o cadastro, a API NestJS provê os endpoints para completar a configuração inicial do workspace:
- `POST /workspaces/onboarding`: Cria o workspace na tabela `workspaces`, registra o usuário como `OWNER` em `workspace_members` e cria as categorias padrão do workspace.

---

## 4. Segurança e Isolamento Multi-tenant

- **Guard NestJS (`JwtAuthGuard` & `WorkspaceGuard`)**: Todo request autenticado inclui o header `Authorization: Bearer <token>` e o header `x-workspace-id`.
- A API intercepta o `workspaceId` e assegura que a consulta no Prisma MySQL seja filtrada obrigatoriamente por `where: { workspaceId }`.
