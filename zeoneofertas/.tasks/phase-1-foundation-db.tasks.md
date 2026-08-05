# Phase 1 Checklist: Fundação, Docker, Banco de Dados MySQL e Shell Next.js

> Especificações de referência: [.specs/01-overview-architecture.spec.md](file:///c:/Users/Zeyah/Desktop/projects/systemzeone/zeoneofertas/.specs/01-overview-architecture.spec.md), [.specs/02-database-schema-rls.spec.md](file:///c:/Users/Zeyah/Desktop/projects/systemzeone/zeoneofertas/.specs/02-database-schema-rls.spec.md)

---

- [ ] `1.1` **Configuração de Infraestrutura Docker e MySQL**
  - [ ] Criar o arquivo `docker-compose.yml` na raiz com os serviços `mysql` (versão 8.0) e `api`.
  - [ ] Criar o `Dockerfile` para a API NestJS na pasta `api/`.
  - [ ] Testar a subida dos containers com `docker compose up -d` e verificar a saúde da conexão MySQL.

- [ ] `1.2` **Inicialização da API Backend (NestJS + Prisma ORM + MySQL)**
  - [ ] Configurar Prisma ORM no projeto `api/` (`npx prisma init`).
  - [ ] Definir o modelo de dados no `api/prisma/schema.prisma` com todas as 16 tabelas e relacionamentos.
  - [ ] Executar a migration inicial (`npx prisma migrate dev --name init`) criando as tabelas no MySQL.
  - [ ] Configurar validação de variáveis de ambiente com `zod` ou `@nestjs/config`.

- [ ] `1.3` **Configuração da Aplicação Frontend (Next.js)**
  - [ ] Configurar o tema base e variáveis CSS em `site/app/globals.css` conforme o [DESIGN.md](file:///c:/Users/Zeyah/Desktop/projects/systemzeone/zeoneofertas/DESIGN.md).
  - [ ] Instalar componentes base shadcn/ui e configurar o cliente Axios/Fetch para se comunicar com a API NestJS (`http://localhost:3001`).
  - [ ] Criar o componente de Layout Shell (`Sidebar` retrátil, `Header` translúcido, Seletor de Workspace, Alternador de Tema).
