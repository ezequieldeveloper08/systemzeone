# Specification 08: Configurações, Integrações Seguras e Docker (NestJS + MySQL)

> **Projeto**: OfertaHub (zeoneofertas)  
> **Versão**: 2.0 (Atualizado com Docker & MySQL)  
> **Status**: Aprovado  

---

## 1. Visão Geral

Esta especificação define o painel de configurações do workspace (`/settings`), a orquestração via Docker e a gestão segura de chaves de API e credenciais de marketplaces no backend NestJS.

---

## 2. Configuração de Variáveis de Ambiente (`.env`)

```env
# Configurações do MySQL (Docker)
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=ofertahub
MYSQL_USER=ofertahub_user
MYSQL_PASSWORD=ofertahub_pass
MYSQL_PORT=3306

# URL de Conexão Prisma ORM
DATABASE_URL=mysql://ofertahub_user:ofertahub_pass@localhost:3306/ofertahub

# Autenticação JWT
JWT_SECRET=super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Integração Mercado Livre
MERCADO_LIVRE_CLIENT_ID=xxx
MERCADO_LIVRE_CLIENT_SECRET=xxx

# Integração Shopee
SHOPEE_AFFILIATE_APP_ID=xxx
SHOPEE_AFFILIATE_SECRET=xxx

# Configuração de Porta da API
PORT=3001
```

---

## 3. Segurança e Execução em Container Docker

- A API NestJS executa dentro do container `ofertahub_api` isolada da rede externa pública.
- O MySQL executa no container `ofertahub_mysql` mantendo o volume persistente `mysql_data`.
- Chaves de API e secrets de afiliados residem exclusivamente no container backend, nunca trafegando para o navegador cliente.
