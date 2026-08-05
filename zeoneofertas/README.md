# 🚀 OfertaHub - Sistema Web SaaS para Afiliados e Curadores de Ofertas

O **OfertaHub** é um sistema web SaaS completo voltado para afiliados, criadores de conteúdo e administradores de grupos de transmissão de ofertas (WhatsApp, Telegram, Instagram).

---

## 🛠️ Tecnologias Utilizadas

### Frontend (`site/`)
- **Framework**: Next.js 16 (App Router) + React 19.
- **Linguagem**: TypeScript.
- **Estilização**: Tailwind CSS v4 + `tw-animate-css` + shadcn/ui.
- **Design System**: Guia mestre [DESIGN.md](file:///c:/Users/Zeyah/Desktop/projects/systemzeone/zeoneofertas/DESIGN.md) (Laranja/Âmbar `#F59E0B` + Slate escuro `#0F172A`).
- **Gerenciamento de Estado**: React Context (`WorkspaceContext`) + `next-themes`.

### Backend API (`api/`) & Containerização
- **Framework Backend**: NestJS (TypeScript) estruturado com Clean Architecture, SOLID e DDD.
- **Banco de Dados**: **MySQL 8.0** orquestrado via Docker Container.
- **ORM & Migrations**: **Prisma ORM** (`prisma/schema.prisma` com 16 modelos).
- **Autenticação**: **JWT (JSON Web Tokens)** + `bcrypt` para hash de senhas.
- **Containerização**: `docker-compose.yml` e `Dockerfile`.

---

## ⚡ Como Executar a Aplicação Localmente

### Pré-requisitos
- Docker & Docker Compose instalados.
- Node.js v20+ e npm.

### 1. Subir o Banco de Dados MySQL e a API NestJS via Docker Compose
Na raiz do projeto (`zeoneofertas/`):

```bash
docker compose up -d --build
```

Isso iniciará:
- **MySQL 8.0** na porta `3306`.
- **API NestJS** na porta `3001`.

### 2. Rodar as Migrações do Prisma e o Seeder no MySQL
Na pasta `api/`:

```bash
cd api
npx prisma migrate dev --name init
npx prisma db seed
```

### 3. Subir o Frontend Next.js
Na pasta `site/`:

```bash
cd site
npm run dev
```

Acesse o sistema no seu navegador em: `http://localhost:3000`.

---

## 📂 Estrutura do Projeto

```
zeoneofertas/
├── docker-compose.yml       # Orquestração do MySQL e API NestJS
├── DESIGN.md                # Guia mestre do Design System (tokens, cores, UI)
├── prompt.md                # Requisitos do projeto
├── .specs/                  # Especificações técnicas detalhadas (01 a 08)
├── .tasks/                  # Checklists de desenvolvimento por fases (1 a 7)
├── api/                     # Backend NestJS + Prisma ORM + MySQL
│   ├── Dockerfile
│   ├── prisma/
│   │   ├── schema.prisma   # 16 modelos do banco de dados relacional
│   │   └── seed.ts         # Script de seeder com dados realistas
│   └── src/
│       ├── auth/            # Autenticação JWT e hash bcrypt
│       ├── workspaces/      # Gestão de workspaces e onboarding
│       ├── marketplaces/    # MercadoLivreProvider & adaptadores
│       ├── offers/          # Algoritmo de Score (0-100 pts)
│       ├── publications/    # Disparo e histórico de publicações
│       └── categories/      # CRUD de categorias internas
└── site/                    # Frontend Next.js
    ├── app/
    │   ├── (auth)/          # Login, Register, Forgot Password, Onboarding
    │   ├── (dashboard)/     # Dashboard, Buscador, Ofertas, Links, Cupons, Gerador, Canvas, Publicações, Categorias, Configurações
    │   └── r/[id]/          # Rota de redirecionamento e telemetria de cliques
    ├── components/          # Shell UI (Sidebar, Header, WorkspaceProvider)
    └── lib/                 # Cliente HTTP ApiClient
```

---

## 📄 Licença e Uso
Desenvolvido exclusivamente para gestão de ofertas de afiliados.
