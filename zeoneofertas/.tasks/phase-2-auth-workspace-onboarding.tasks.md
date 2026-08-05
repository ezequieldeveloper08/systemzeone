# Phase 2 Checklist: Autenticação JWT NestJS, Workspaces e Onboarding

> Especificação de referência: [.specs/03-auth-workspace-onboarding.spec.md](file:///c:/Users/Zeyah/Desktop/projects/systemzeone/zeoneofertas/.specs/03-auth-workspace-onboarding.spec.md)

---

- [ ] `2.1` **Módulo de Autenticação JWT na API NestJS (`api/src/auth`)**
  - [ ] Implementar `AuthModule`, `AuthService` e `AuthController`.
  - [ ] Implementar rotas `/auth/register` (hash com `bcrypt`), `/auth/login` (gerando JWT) e `/auth/me`.
  - [ ] Criar o `JwtStrategy` e `JwtAuthGuard` para proteger endpoints privados.

- [ ] `2.2` **Telas de Autenticação no Frontend (`site/app/(auth)`)**
  - [ ] Implementar formulário de Login (`/login`) integrando com a API NestJS e salvando o token JWT.
  - [ ] Implementar formulário de Cadastro (`/register`) e fluxo de erro/sucesso.
  - [ ] Implementar telas de Recuperação de Senha (`/forgot-password`, `/reset-password`).

- [ ] `2.3` **Contexto de Workspace e Permissões**
  - [ ] Criar `WorkspaceContext` e hook `useWorkspace()` para gerenciar o workspace ativo no frontend.
  - [ ] Incluir o header `x-workspace-id` em todas as chamadas HTTP à API.

- [ ] `2.4` **Wizard de Onboarding Interativo (`/onboarding`)**
  - [ ] Desenvolver formulário de 5 passos no frontend.
  - [ ] Integrar com o endpoint `POST /workspaces/onboarding` da API NestJS para salvar o workspace no MySQL.
