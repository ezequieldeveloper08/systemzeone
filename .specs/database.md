# Engenharia de Banco de Dados: Modelo Físico Completo

Este documento detalha o modelo relacional de banco de dados do sistema multi-tenant de concessionárias Capri Veículos. Apresenta o diagrama, os dicionários de dados detalhados, o código SQL DDL completo com constraints rígidas, índices e triggers de isolamento.

---

## 💾 Infraestrutura & Configuração do SGBD

O banco de dados utiliza a seguinte infraestrutura no container Docker:

- **SGBD**: PostgreSQL 15.3 (Alpine Linux)
- **Database**: `veiculos`
- **Estratégia de Isolamento**: *Shared Database / Logical Isolation* via chave estrangeira `tenant_id`.
- **Validações Físicas**: Garantidas por `CHECK constraints` nativas no banco para consistência de dados corporativos (status de leads, tipos de transmissão, etc.).

---

## 📐 Diagrama de Relacionamento Físico (ERD)

```mermaid
erDiagram
    tenants ||--o{ users : "1:N (possui)"
    tenants ||--o{ brands : "1:N (cadastra)"
    tenants ||--o{ vehicles : "1:N (estoque)"
    tenants ||--o{ leads : "1:N (gerencia)"
    tenants ||--o1 whatsapp_settings : "1:1 (configura)"
    tenants ||--o{ whatsapp_templates : "1:N (cria)"
    tenants ||--o{ whatsapp_logs : "1:N (audita)"
    
    brands ||--o{ vehicles : "1:N (marca)"
    vehicles ||--o{ leads : "1:N (interesse)"
    leads ||--o{ whatsapp_logs : "1:N (recebe)"
```

---

## 🗂️ Tabelas do Sistema (Dicionários & DDLs)

### 1. Tabela: `tenants` (Concessionárias)
Entidade raiz que determina o escopo lógico de dados do locatário (Multi-tenant).

| Campo | Tipo SQL | Nulidade | Restrições | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `NOT NULL` | `PRIMARY KEY` | Identificador único. |
| `name` | `VARCHAR(255)` | `NOT NULL` | `UNIQUE` | Razão social ou nome fantasia único. |
| `created_at` | `TIMESTAMP` | `NOT NULL` | `DEFAULT now()` | Timestamp de criação. |
| `updated_at` | `TIMESTAMP` | `NOT NULL` | `DEFAULT now()` | Timestamp de modificação. |

```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

### 2. Tabela: `users` (Usuários / Operadores)
Operadores administrativos do painel.

| Campo | Tipo SQL | Nulidade | Restrições | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `NOT NULL` | `PRIMARY KEY` | Identificador único. |
| `name` | `VARCHAR(255)` | `NOT NULL` | - | Nome completo do usuário. |
| `email` | `VARCHAR(255)` | `NOT NULL` | `UNIQUE` | E-mail de acesso. |
| `password_hash`| `VARCHAR(255)` | `NOT NULL` | - | Senha em formato Bcrypt. |
| `tenant_id` | `UUID` | `NOT NULL` | `FOREIGN KEY` | Referencia `tenants(id)` `ON DELETE CASCADE`. |
| `created_at` | `TIMESTAMP` | `NOT NULL` | `DEFAULT now()` | Data de registro. |
| `updated_at` | `TIMESTAMP` | `NOT NULL` | `DEFAULT now()` | Última edição do perfil. |

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    tenant_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE
);
```

---

### 3. Tabela: `brands` (Marcas de Veículos)
Fabricantes cadastrados pelas concessionárias ou globalmente.

| Campo | Tipo SQL | Nulidade | Restrições | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `NOT NULL` | `PRIMARY KEY` | Identificador da marca. |
| `name` | `VARCHAR(100)` | `NOT NULL` | `UNIQUE` | Nome da marca (ex: Chevrolet, BYD). |
| `logo_url` | `VARCHAR(512)` | `YES` | - | Link para o logotipo da fabricante. |
| `tenant_id` | `UUID` | `NOT NULL` | `FOREIGN KEY` | Referencia `tenants(id)` `ON DELETE CASCADE`. |
| `created_at` | `TIMESTAMP` | `NOT NULL` | `DEFAULT now()` | Inserção da marca. |
| `updated_at` | `TIMESTAMP` | `NOT NULL` | `DEFAULT now()` | Atualização. |

```sql
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    logo_url VARCHAR(512),
    tenant_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_brands_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE
);
```

---

### 4. Tabela: `vehicles` (Catálogo de Veículos)
Estoque detalhado de veículos de cada concessionária.

| Campo | Tipo SQL | Nulidade | Restrições | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `NOT NULL` | `PRIMARY KEY` | Identificador único. |
| `tenant_id` | `UUID` | `NOT NULL` | `FOREIGN KEY` | Referencia `tenants(id)` `ON DELETE CASCADE`. |
| `brand_id` | `UUID` | `NOT NULL` | `FOREIGN KEY` | Referencia `brands(id)` `ON DELETE RESTRICT`. |
| `title` | `VARCHAR(255)` | `NOT NULL` | - | Título comercial (anúncio). |
| `description` | `TEXT` | `YES` | - | Texto completo de detalhes do carro. |
| `model` | `VARCHAR(100)` | `NOT NULL` | - | Modelo do veículo (ex: Tracker, Seal). |
| `version` | `VARCHAR(100)` | `NOT NULL` | - | Motor/Configuração (ex: 1.2 Turbo LTZ). |
| `year_manufacture`| `INTEGER`| `NOT NULL` | `CHECK (>= 1900)` | Ano real de fabricação. |
| `year_model` | `INTEGER` | `NOT NULL` | `CHECK (>= 1900)` | Ano do modelo comercial. |
| `price` | `NUMERIC(12,2)`| `NOT NULL` | `CHECK (>= 0)` | Preço de anúncio. |
| `mileage` | `INTEGER` | `NOT NULL` | `CHECK (>= 0)` | Quilometragem (Km). |
| `color` | `VARCHAR(50)` | `NOT NULL` | - | Cor externa do veículo. |
| `fuel_type` | `VARCHAR(30)` | `NOT NULL` | `CHECK IN (...)` | Tipo de combustível. |
| `transmission_type`| `VARCHAR(30)`| `NOT NULL` | `CHECK IN (...)` | Tipo de transmissão do veículo. |
| `body_type` | `VARCHAR(30)` | `NOT NULL` | `CHECK IN (...)` | Carroceria (SUV, Hatch, etc). |
| `plate_ending` | `VARCHAR(5)` | `NOT NULL` | - | Último dígito ou final de placa. |
| `condition` | `VARCHAR(30)` | `NOT NULL` | `CHECK IN (...)` | Novo, Seminovo ou Usado. |
| `status` | `VARCHAR(30)` | `NOT NULL` | `CHECK IN (...)` | Disponibilidade do veículo. |
| `image_url` | `VARCHAR(512)` | `YES` | - | Link para imagem principal. |

```sql
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    brand_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    model VARCHAR(100) NOT NULL,
    version VARCHAR(100) NOT NULL,
    year_manufacture INTEGER NOT NULL CHECK (year_manufacture >= 1900),
    year_model INTEGER NOT NULL CHECK (year_model >= 1900),
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    mileage INTEGER NOT NULL CHECK (mileage >= 0),
    color VARCHAR(50) NOT NULL,
    fuel_type VARCHAR(30) NOT NULL CHECK (fuel_type IN ('Gasolina', 'Álcool', 'Flex', 'Diesel', 'Elétrico', 'Híbrido')),
    transmission_type VARCHAR(30) NOT NULL CHECK (transmission_type IN ('Manual', 'Automático', 'CVT', 'Dupla Embreagem')),
    body_type VARCHAR(30) NOT NULL CHECK (body_type IN ('Sedan', 'Hatch', 'SUV', 'Picape', 'Cupê', 'Conversível')),
    plate_ending VARCHAR(5) NOT NULL,
    condition VARCHAR(30) NOT NULL CHECK (condition IN ('Novo', 'Seminovo', 'Usado')),
    status VARCHAR(30) NOT NULL DEFAULT 'Disponível' CHECK (status IN ('Disponível', 'Reservado', 'Vendido', 'Inativo')),
    image_url VARCHAR(512),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicles_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_vehicles_brand FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE RESTRICT
);
```

---

### 5. Tabela: `leads` (Oportunidades de Vendas)
Contatos de leads captados para negociação.

| Campo | Tipo SQL | Nulidade | Restrições | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `NOT NULL` | `PRIMARY KEY` | Identificador único do lead. |
| `tenant_id` | `UUID` | `NOT NULL` | `FOREIGN KEY` | Referencia `tenants(id)` `ON DELETE CASCADE`. |
| `vehicle_id` | `UUID` | `YES` | `FOREIGN KEY` | Referencia `vehicles(id)` `ON DELETE SET NULL`. |
| `name` | `VARCHAR(255)` | `NOT NULL` | - | Nome completo do lead. |
| `email` | `VARCHAR(255)` | `YES` | - | E-mail para contato. |
| `phone` | `VARCHAR(30)` | `NOT NULL` | - | WhatsApp ou número de telefone. |
| `origin` | `VARCHAR(50)` | `NOT NULL` | `CHECK IN (...)` | Origem da captura (WhatsApp, Site, etc). |
| `status` | `VARCHAR(50)` | `NOT NULL` | `CHECK IN (...)` | Status da oportunidade. |
| `temperature` | `VARCHAR(20)` | `NOT NULL` | `CHECK IN (...)` | Frio, Morno ou Quente. |
| `notes` | `TEXT` | `YES` | - | Notas de conversação interna. |

```sql
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    vehicle_id UUID,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(30) NOT NULL,
    origin VARCHAR(50) NOT NULL CHECK (origin IN ('WhatsApp', 'Site', 'Portal', 'Showroom')),
    status VARCHAR(50) NOT NULL DEFAULT 'Novo' CHECK (status IN ('Novo', 'Em Atendimento', 'Test Drive', 'Proposta Enviada', 'Ganho', 'Perdido')),
    temperature VARCHAR(20) NOT NULL DEFAULT 'Morno' CHECK (temperature IN ('Frio', 'Morno', 'Quente')),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_leads_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_leads_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
);
```

---

### 6. Tabela: `whatsapp_settings` (Configuração Meta API)
Credenciais oficiais da API da Meta de cada concessionária.

| Campo | Tipo SQL | Nulidade | Restrições | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `NOT NULL` | `PRIMARY KEY` | Identificador. |
| `tenant_id` | `UUID` | `NOT NULL` | `UNIQUE`, `FOREIGN KEY` | Referencia `tenants(id)` `ON DELETE CASCADE`. |
| `access_token` | `TEXT` | `NOT NULL` | - | Token Bearer permanente da Meta Graph API. |
| `phone_number_id`| `VARCHAR(100)`| `NOT NULL` | - | ID do telefone. |
| `business_account_id`| `VARCHAR(100)`| `NOT NULL` | - | ID da WABA. |
| `webhook_verify_token`| `VARCHAR(100)`| `NOT NULL` | - | Token de verificação de webhook local. |
| `status` | `VARCHAR(30)` | `NOT NULL` | `CHECK IN (...)` | Status da autenticação. |

```sql
CREATE TABLE whatsapp_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL UNIQUE,
    access_token TEXT NOT NULL,
    phone_number_id VARCHAR(100) NOT NULL,
    business_account_id VARCHAR(100) NOT NULL,
    webhook_verify_token VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_whatsapp_settings_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);
```

---

### 7. Tabela: `whatsapp_templates` (Modelos Meta)
Modelos de mensagem criados e cadastrados.

| Campo | Tipo SQL | Nulidade | Restrições | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `NOT NULL` | `PRIMARY KEY` | ID do modelo. |
| `tenant_id` | `UUID` | `NOT NULL` | `FOREIGN KEY` | Referencia `tenants(id)` `ON DELETE CASCADE`. |
| `name` | `VARCHAR(100)` | `NOT NULL` | - | Nome identificador (ex: `boas_vindas`). |
| `category` | `VARCHAR(50)` | `NOT NULL` | `CHECK IN (...)` | MARKETING, UTILITY, AUTHENTICATION. |
| `language` | `VARCHAR(10)` | `NOT NULL` | - | Código idioma (ex: `pt_BR`). |
| `status` | `VARCHAR(50)` | `NOT NULL` | `CHECK IN (...)` | Status na Meta (APPROVED, etc). |
| `header_type` | `VARCHAR(20)` | `NOT NULL` | `CHECK IN (...)` | TEXT, IMAGE, DOCUMENT, NONE. |
| `header_text` | `VARCHAR(255)` | `YES` | - | Texto do cabeçalho. |
| `body_text` | `TEXT` | `NOT NULL` | - | Corpo principal do texto. |
| `footer_text` | `VARCHAR(255)` | `YES` | - | Rodapé. |
| `buttons` | `JSONB` | `NOT NULL` | `DEFAULT '[]'` | Configurações de botões (Call, URL). |
| `variables` | `JSONB` | `NOT NULL` | `DEFAULT '[]'` | Vetor de nomes descritivos das variáveis. |

```sql
CREATE TABLE whatsapp_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('MARKETING', 'UTILITY', 'AUTHENTICATION')),
    language VARCHAR(10) NOT NULL DEFAULT 'pt_BR',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    header_type VARCHAR(20) NOT NULL DEFAULT 'NONE' CHECK (header_type IN ('TEXT', 'IMAGE', 'DOCUMENT', 'NONE')),
    header_text VARCHAR(255),
    body_text TEXT NOT NULL,
    footer_text VARCHAR(255),
    buttons JSONB NOT NULL DEFAULT '[]'::jsonb,
    variables JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_whatsapp_templates_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);
```

---

### 8. Tabela: `whatsapp_logs` (Histórico de Envios & Chat)
Histórico de interações por mensagem oficial no WhatsApp.

| Campo | Tipo SQL | Nulidade | Restrições | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `NOT NULL` | `PRIMARY KEY` | Identificador único da mensagem. |
| `tenant_id` | `UUID` | `NOT NULL` | `FOREIGN KEY` | Referencia `tenants(id)` `ON DELETE CASCADE`. |
| `lead_id` | `UUID` | `YES` | `FOREIGN KEY` | Referencia `leads(id)` `ON DELETE SET NULL`. |
| `recipient_name`| `VARCHAR(255)` | `NOT NULL` | - | Nome. |
| `recipient_phone`| `VARCHAR(30)` | `NOT NULL` | - | Telefone do destinatário. |
| `message_direction`| `VARCHAR(20)`| `NOT NULL` | `CHECK IN (...)` | Direção (inbound/outbound). |
| `message_type` | `VARCHAR(30)` | `NOT NULL` | `CHECK IN (...)` | Tipo (text, template, image). |
| `template_name` | `VARCHAR(100)` | `YES` | - | Nome do template se aplicável. |
| `variables` | `JSONB` | `NOT NULL` | `DEFAULT '{}'` | Variáveis injetadas (chave-valor). |
| `body_text` | `TEXT` | `NOT NULL` | - | Texto puro decodificado enviado/recebido. |
| `status` | `VARCHAR(50)` | `NOT NULL` | `CHECK IN (...)` | Status (sent, delivered, read, failed). |
| `error_message` | `TEXT` | `YES` | - | Erro em caso de falha. |

```sql
CREATE TABLE whatsapp_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    lead_id UUID,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_phone VARCHAR(30) NOT NULL,
    message_direction VARCHAR(20) NOT NULL CHECK (message_direction IN ('inbound', 'outbound')),
    message_type VARCHAR(30) NOT NULL CHECK (message_type IN ('text', 'template', 'image', 'document')),
    template_name VARCHAR(100),
    variables JSONB NOT NULL DEFAULT '{}'::jsonb,
    body_text TEXT NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_whatsapp_logs_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_whatsapp_logs_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
);
```

---

## 📈 Índices de Banco (Performance)

Índices específicos criados para evitar perdas de desempenho e assegurar o isolamento lógico veloz em produção:

```sql
-- 1. Índices B-Tree básicos nas chaves estrangeiras de Tenant (Filtros de Multi-tenancy)
CREATE INDEX idx_users_tenant ON users (tenant_id);
CREATE INDEX idx_brands_tenant ON brands (tenant_id);
CREATE INDEX idx_vehicles_tenant ON vehicles (tenant_id);
CREATE INDEX idx_leads_tenant ON leads (tenant_id);
CREATE INDEX idx_whatsapp_settings_tenant ON whatsapp_settings (tenant_id);
CREATE INDEX idx_whatsapp_templates_tenant ON whatsapp_templates (tenant_id);
CREATE INDEX idx_whatsapp_logs_tenant ON whatsapp_logs (tenant_id);

-- 2. Índice composto para aceleração do estoque de veículos por concessionária
CREATE INDEX idx_vehicles_tenant_brand_price ON vehicles (tenant_id, brand_id, price);

-- 3. Índice GIN (Generalized Inverted Index) para consultas rápidas na carga de variáveis (JSONB)
CREATE INDEX idx_whatsapp_logs_variables ON whatsapp_logs USING gin (variables);
```

---

## 🔒 Triggers de Segurança (Integridade Lógica)

Funções de banco plpgsql e triggers criadas para evitar a mudança acidental ou transferência maliciosa de registros entre concessionárias distintas.

```sql
CREATE OR REPLACE FUNCTION protect_tenant_id_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.tenant_id IS DISTINCT FROM NEW.tenant_id THEN
        RAISE EXCEPTION 'Erro de Integridade: Não é permitido transferir registros de domínio entre Tenants.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cadastro de Triggers de Proteção de Isolamento
CREATE TRIGGER trg_protect_vehicle_tenant BEFORE UPDATE ON vehicles
FOR EACH ROW EXECUTE FUNCTION protect_tenant_id_update();

CREATE TRIGGER trg_protect_lead_tenant BEFORE UPDATE ON leads
FOR EACH ROW EXECUTE FUNCTION protect_tenant_id_update();

CREATE TRIGGER trg_protect_log_tenant BEFORE UPDATE ON whatsapp_logs
FOR EACH ROW EXECUTE FUNCTION protect_tenant_id_update();
```
