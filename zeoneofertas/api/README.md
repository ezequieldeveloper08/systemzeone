# OfertaHub API (NestJS + MySQL + Prisma)

API backend para o sistema OfertaHub rodando com NestJS, Prisma ORM e MySQL 8.0.

## 🚀 Como Executar o Banco MySQL com Docker

Para rodar apenas a infraestrutura do banco de dados MySQL + phpMyAdmin para desenvolvimento da API:

```bash
cd api
docker compose up -d
```

Isso iniciará:
- **MySQL 8.0** em `localhost:3306` (Usuário: `ofertahub_user` / Senha: `ofertahub_pass` / Banco: `ofertahub`).
- **phpMyAdmin** em `http://localhost:8080` para gerenciamento visual do MySQL.

## 🛠️ Migrações e Seeder

Após subir o container do MySQL:

```bash
# Executar migrações do Prisma
npx prisma migrate dev --name init

# Popular o banco com dados de demonstração
npx prisma db seed
```

## 💻 Executar a API em modo de desenvolvimento

```bash
npm run start:dev
```

A API estará rodando em `http://localhost:3001`.
