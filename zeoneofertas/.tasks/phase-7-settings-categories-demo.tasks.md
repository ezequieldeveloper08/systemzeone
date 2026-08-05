# Phase 7 Checklist: Configurações, Fontes de Busca e Dados de Demonstração (Prisma MySQL)

> Especificação de referência: [.specs/08-settings-integrations-security.spec.md](file:///c:/Users/Zeyah/Desktop/projects/systemzeone/zeoneofertas/.specs/08-settings-integrations-security.spec.md)

---

- [ ] `7.1` **Painel de Configurações e Categorias (`/settings`)**
  - [ ] Implementar abas de Perfil, Empresa, Identidade Visual, Marketplaces, Membros e Permissões conectadas à API NestJS.
  - [ ] Criar CRUD de Categorias Internas no MySQL via Prisma ORM.
  - [ ] Implementar gestão de Buscas Salvas / Fontes Automáticas com o botão "Executar Agora".

- [ ] `7.2` **Seeder Prisma com Dados de Demonstração Realistas (`api/prisma/seed.ts`)**
  - [ ] Criar script de seed (`npx prisma db seed`) populando o MySQL com dados demonstrativos:
    - [ ] Parafusadeira DeWalt
    - [ ] Furadeira Makita
    - [ ] Air Fryer
    - [ ] Smart TV 55"
    - [ ] Smartphone Galaxy / iPhone
    - [ ] Fone Bluetooth ANC
    - [ ] Kit de Ferramentas Manuais
  - [ ] Garantir imagens funcionais, preços anteriores e atuais com cálculo de desconto real, cupons e status de links.

- [ ] `7.3` **Polimento e Documentação Final**
  - [ ] Validar a subida completa com `docker compose up --build`.
  - [ ] Criar arquivo `README.md` detalhado explicando a execução via Docker e migrações.
  - [ ] Criar arquivo `.env.example`.
