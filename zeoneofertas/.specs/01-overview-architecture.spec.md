# Specification 01: Visão Geral e Arquitetura do Sistema (NestJS + MySQL + Docker)

> **Projeto**: OfertaHub (zeoneofertas)  
> **Versão**: 2.0 (Atualizado com MySQL & Docker)  
> **Status**: Aprovado  

---

## 1. Visão Geral do Sistema

O **OfertaHub** é um sistema web SaaS voltado para afiliados, criadores de conteúdo e administradores de grupos de ofertas. O sistema automatiza o processo de descoberta de ofertas em marketplaces, curadoria, conversão de links de afiliados, geração de textos promocionais, criação de artes visuais e acompanhamento de publicações e cliques.

---

## 2. Arquitetura Tecnológica e Infraestrutura Docker

### Frontend (`site/`)
- **Framework**: Next.js (App Router, Server & Client Components).
- **Linguagem**: TypeScript.
- **Estilização**: Tailwind CSS v4 + `tw-animate-css` + shadcn/ui.
- **Gerenciamento de Estado & Cache**: React Query (`@tanstack/react-query`).
- **Validação de Dados**: Zod.
- **Ícones**: Lucide React.

### Backend API (`api/`) & Banco de Dados (Dockerized)
- **Framework Backend**: NestJS (TypeScript) estruturado com Clean Architecture, SOLID e DDD.
- **Banco de Dados**: **MySQL 8.0** executado via Docker Container.
- **ORM & Migrations**: **Prisma ORM** (`prisma/schema.prisma`) para modelagem tipada, migrations e relacionamentos.
- **Autenticação**: **JWT (JSON Web Tokens)** + `passport-jwt` + `bcrypt` para hash de senhas e autorização de workspace.
- **Containerização**:
  - `Dockerfile` para a aplicação NestJS API.
  - `docker-compose.yml` para orquestração da API NestJS e do container do MySQL 8.0.

---

## 3. Padrão Provider de Marketplaces na API NestJS

Para integrar marketplaces sem fingir APIs inexistentes, a API disponibiliza serviços modulares baseados na interface `MarketplaceProvider`:

```typescript
export interface MarketplaceProvider {
  marketplaceId: 'MERCADO_LIVRE' | 'SHOPEE' | 'MANUAL';
  
  searchProducts(params: SearchProductParams): Promise<ProductSearchResult>;
  getProductOffers(productId: string): Promise<MarketplaceOffer[]>;
  getProductDetails(itemId: string): Promise<ProductDetails>;
  validateAffiliateLink?(url: string): Promise<boolean>;
}
```

### Implementações no Backend:
1. **MercadoLivreProvider**:
   - Consome a API Oficial do Mercado Livre (`https://api.mercadolibre.com`).
   - Busca por termos, produtos de catálogo (`/products/search`), anúncios vinculados (`/products/{id}/items`) e detalhes (`/items/{id}`).
2. **ShopeeProvider**:
   - Adaptador preparado para integração com a *Shopee Affiliate Open API*.
3. **ManualMarketplaceProvider**:
   - Permite cadastro manual de produtos de qualquer marketplace ou loja parceira.

---

## 4. Orquestração com Docker Compose (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: ofertahub_mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: ofertahub
      MYSQL_USER: ofertahub_user
      MYSQL_PASSWORD: ofertahub_pass
    ports:
      - '3306:3306'
    volumes:
      - mysql_data:/var/lib/mysql

  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    container_name: ofertahub_api
    restart: always
    ports:
      - '3001:3001'
    environment:
      DATABASE_URL: 'mysql://ofertahub_user:ofertahub_pass@mysql:3306/ofertahub'
      JWT_SECRET: 'super-secret-jwt-key'
    depends_on:
      - mysql

volumes:
  mysql_data:
```

---

## 5. Fluxo de Dados End-to-End

```mermaid
flowchart TD
    A[Usuário no Frontend Next.js] --> B[API NestJS Container]
    B --> C{Marketplace Provider}
    C -->|Mercado Livre API| D[API Oficial Mercado Livre]
    C -->|Manual / Shopee| E[Banco de Dados MySQL]
    B --> F[Prisma ORM]
    F --> E
    E --> B
    B --> A
```
