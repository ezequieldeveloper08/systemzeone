Abaixo está uma especificação profissional para um CRM com **Lead, Cliente, WhatsApp, Pipeline e Oportunidades**.

# Requisitos do CRM

## 1. Conceito principal

O sistema **não deve ter tabelas separadas para Lead e Cliente**.

A entidade principal deve ser:

```txt
Contact
```

Ela representa qualquer pessoa ou empresa que se relaciona com o negócio.

Um contato pode estar em diferentes fases:

```txt
LEAD
PROSPECT
CUSTOMER
INACTIVE_CUSTOMER
PARTNER
SUPPLIER
```

A diferença entre lead e cliente será definida pelo **ciclo comercial**, não por duplicação de cadastro.

---

# Entidade principal: Contact

## Contact

Representa uma pessoa ou empresa dentro de um tenant.

```ts
Contact {
  id: uuid

  tenantId: uuid

  type: ContactType
  lifecycleStage: LifecycleStage
  status: ContactStatus

  name: string
  displayName: string | null

  documentType: DocumentType | null
  document: string | null

  email: string | null
  phone: string
  whatsappId: string | null

  companyName: string | null
  jobTitle: string | null

  source: ContactSource
  sourceDetails: string | null

  ownerId: uuid | null

  leadScore: number
  temperature: LeadTemperature

  firstContactAt: Date | null
  lastContactAt: Date | null
  convertedAt: Date | null

  lostReason: string | null
  notes: string | null

  isBlocked: boolean
  isArchived: boolean

  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}
```

---

# Enums

## ContactType

```ts
enum ContactType {
  PERSON = 'PERSON',
  COMPANY = 'COMPANY'
}
```

---

## LifecycleStage

```ts
enum LifecycleStage {
  LEAD = 'LEAD',
  MQL = 'MQL',
  SQL = 'SQL',
  OPPORTUNITY = 'OPPORTUNITY',
  CUSTOMER = 'CUSTOMER',
  INACTIVE_CUSTOMER = 'INACTIVE_CUSTOMER',
  EVANGELIST = 'EVANGELIST',
  OTHER = 'OTHER'
}
```

---

## ContactStatus

```ts
enum ContactStatus {
  NEW = 'NEW',
  IN_SERVICE = 'IN_SERVICE',
  WAITING_CUSTOMER = 'WAITING_CUSTOMER',
  QUALIFIED = 'QUALIFIED',
  NEGOTIATION = 'NEGOTIATION',
  PROPOSAL_SENT = 'PROPOSAL_SENT',
  WON = 'WON',
  LOST = 'LOST',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED'
}
```

---

## ContactSource

```ts
enum ContactSource {
  WHATSAPP = 'WHATSAPP',
  INSTAGRAM = 'INSTAGRAM',
  FACEBOOK_ADS = 'FACEBOOK_ADS',
  GOOGLE_ADS = 'GOOGLE_ADS',
  WEBSITE = 'WEBSITE',
  LANDING_PAGE = 'LANDING_PAGE',
  REFERRAL = 'REFERRAL',
  MANUAL = 'MANUAL',
  IMPORTED = 'IMPORTED',
  OTHER = 'OTHER'
}
```

---

## LeadTemperature

```ts
enum LeadTemperature {
  COLD = 'COLD',
  WARM = 'WARM',
  HOT = 'HOT'
}
```

---

## DocumentType

```ts
enum DocumentType {
  CPF = 'CPF',
  CNPJ = 'CNPJ',
  OTHER = 'OTHER'
}
```

---

# Entidade Deal

Representa uma oportunidade comercial.

Um contato pode ter vários negócios.

```ts
Deal {
  id: uuid

  tenantId: uuid
  contactId: uuid
  pipelineId: uuid
  stageId: uuid

  title: string
  description: string | null

  value: decimal
  currency: string

  status: DealStatus

  expectedCloseDate: Date | null
  closedAt: Date | null

  lostReason: string | null

  ownerId: uuid | null

  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}
```

---

## DealStatus

```ts
enum DealStatus {
  OPEN = 'OPEN',
  WON = 'WON',
  LOST = 'LOST',
  CANCELED = 'CANCELED'
}
```

---

# Entidade Pipeline

```ts
Pipeline {
  id: uuid

  tenantId: uuid

  name: string
  description: string | null

  isDefault: boolean
  isActive: boolean

  createdAt: Date
  updatedAt: Date
}
```

---

# Entidade PipelineStage

```ts
PipelineStage {
  id: uuid

  tenantId: uuid
  pipelineId: uuid

  name: string
  order: number

  probability: number

  isWonStage: boolean
  isLostStage: boolean

  createdAt: Date
  updatedAt: Date
}
```

---

# Pipeline padrão recomendado

```txt
Novo Lead
↓
Contato Iniciado
↓
Qualificado
↓
Diagnóstico
↓
Proposta Enviada
↓
Negociação
↓
Fechado - Ganho
↓
Fechado - Perdido
```

---

# Entidade Conversation

Representa uma conversa no WhatsApp.

```ts
Conversation {
  id: uuid

  tenantId: uuid
  contactId: uuid

  channel: ConversationChannel

  whatsappPhoneNumberId: string | null
  customerPhone: string

  status: ConversationStatus

  assignedToUserId: uuid | null

  lastMessageAt: Date | null
  lastMessagePreview: string | null

  unreadCount: number

  createdAt: Date
  updatedAt: Date
  closedAt: Date | null
}
```

---

## ConversationChannel

```ts
enum ConversationChannel {
  WHATSAPP = 'WHATSAPP',
  INSTAGRAM = 'INSTAGRAM',
  EMAIL = 'EMAIL',
  WEBSITE_CHAT = 'WEBSITE_CHAT'
}
```

---

## ConversationStatus

```ts
enum ConversationStatus {
  OPEN = 'OPEN',
  PENDING = 'PENDING',
  WAITING_CUSTOMER = 'WAITING_CUSTOMER',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED'
}
```

---

# Entidade Message

```ts
Message {
  id: uuid

  tenantId: uuid
  conversationId: uuid
  contactId: uuid

  direction: MessageDirection
  type: MessageType

  whatsappMessageId: string | null

  content: string | null
  payload: json | null

  status: MessageStatus

  sentAt: Date | null
  deliveredAt: Date | null
  readAt: Date | null
  failedAt: Date | null

  createdAt: Date
}
```

---

## MessageDirection

```ts
enum MessageDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND'
}
```

---

## MessageType

```ts
enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  TEMPLATE = 'TEMPLATE',
  INTERACTIVE = 'INTERACTIVE',
  FLOW_REPLY = 'FLOW_REPLY',
  SYSTEM = 'SYSTEM'
}
```

---

## MessageStatus

```ts
enum MessageStatus {
  RECEIVED = 'RECEIVED',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED'
}
```

---

# Entidade Tag

```ts
Tag {
  id: uuid

  tenantId: uuid

  name: string
  color: string | null

  createdAt: Date
  updatedAt: Date
}
```

---

# Entidade ContactTag

```ts
ContactTag {
  id: uuid

  tenantId: uuid
  contactId: uuid
  tagId: uuid

  createdAt: Date
}
```

---

# Entidade Activity

Registra ações importantes no contato.

```ts
Activity {
  id: uuid

  tenantId: uuid
  contactId: uuid
  dealId: uuid | null
  userId: uuid | null

  type: ActivityType

  title: string
  description: string | null

  dueDate: Date | null
  completedAt: Date | null

  createdAt: Date
}
```

---

## ActivityType

```ts
enum ActivityType {
  NOTE = 'NOTE',
  CALL = 'CALL',
  WHATSAPP_MESSAGE = 'WHATSAPP_MESSAGE',
  EMAIL = 'EMAIL',
  MEETING = 'MEETING',
  TASK = 'TASK',
  DEAL_CREATED = 'DEAL_CREATED',
  DEAL_WON = 'DEAL_WON',
  DEAL_LOST = 'DEAL_LOST',
  STATUS_CHANGED = 'STATUS_CHANGED'
}
```

---

# Entidade Order

Quando o CRM também tiver pedidos.

```ts
Order {
  id: uuid

  tenantId: uuid
  contactId: uuid
  dealId: uuid | null

  status: OrderStatus

  totalAmount: decimal
  paymentMethod: string | null

  notes: string | null

  createdAt: Date
  updatedAt: Date
  canceledAt: Date | null
}
```

---

## OrderStatus

```ts
enum OrderStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED'
}
```

---

# Entidade OrderItem

```ts
OrderItem {
  id: uuid

  tenantId: uuid
  orderId: uuid

  productId: uuid | null

  name: string
  quantity: number
  unitPrice: decimal
  totalPrice: decimal

  notes: string | null

  createdAt: Date
}
```

---

# Regras de negócio

## 1. Criação automática de contato pelo WhatsApp

Quando chegar uma mensagem nova no webhook:

```txt
Se existir contato com mesmo phone + tenantId:
  atualizar lastContactAt
  vincular mensagem ao contato existente

Senão:
  criar novo Contact
  lifecycleStage = LEAD
  status = NEW
  source = WHATSAPP
```

---

## 2. Normalização de telefone

Todo telefone deve ser salvo em formato padronizado.

Exemplo:

```txt
5564999999999
```

Regras:

```txt
Remover espaços
Remover parênteses
Remover traços
Remover "+"
Garantir DDI
Validar duplicidade por tenantId + phone
```

---

## 3. Não duplicar contato

Não pode existir dois contatos iguais no mesmo tenant com o mesmo telefone.

Índice único recomendado:

```txt
tenantId + phone
```

Opcional:

```txt
tenantId + email
```

mas email pode ser nulo.

---

## 4. Quando um Lead vira Cliente

Um contato deve virar cliente quando:

```txt
Um Deal for marcado como WON
```

ou

```txt
Um Order for marcado como CONFIRMED/DELIVERED
```

Nesse momento:

```ts
contact.lifecycleStage = CUSTOMER
contact.status = ACTIVE
contact.convertedAt = now()
```

---

## 5. Cliente pode continuar tendo novas oportunidades

Um cliente pode ter vários negócios depois da primeira venda.

Exemplo:

```txt
Cliente João
├── Deal 1: Site institucional - WON
├── Deal 2: Tráfego pago - OPEN
└── Deal 3: Sistema de gestão - LOST
```

---

## 6. Lead perdido não deve ser apagado

Quando perder uma negociação:

```ts
deal.status = LOST
deal.lostReason = motivo
```

O contato pode ficar:

```ts
contact.status = LOST
```

mas não deve ser deletado.

---

## 7. Histórico nunca deve ser apagado

Mensagens, atividades, negócios e pedidos devem permanecer registrados.

Use `deletedAt` para soft delete.

---

## 8. Responsável pelo contato

Um contato pode ter um responsável comercial.

```ts
contact.ownerId = user.id
```

Regras:

```txt
Apenas usuários do mesmo tenant podem ser responsáveis.
Se ownerId for null, o contato fica sem responsável.
```

---

## 9. Temperatura do lead

A temperatura pode ser manual ou calculada.

Sugestão:

```txt
COLD = lead sem interação recente
WARM = respondeu ou demonstrou interesse
HOT = pediu orçamento, preço ou proposta
```

Exemplo automático:

```txt
Se mensagem contém "preço", "valor", "orçamento":
  temperature = HOT
```

---

## 10. Lead Score

Pontuação sugerida:

```txt
Chamou no WhatsApp: +10
Preencheu formulário: +20
Pediu orçamento: +30
Respondeu proposta: +20
Ficou 7 dias sem responder: -10
Virou cliente: +100
```

---

## 11. Status da conversa

Quando cliente manda mensagem:

```ts
conversation.status = OPEN
conversation.unreadCount += 1
```

Quando atendente responde:

```ts
conversation.status = WAITING_CUSTOMER
```

Quando atendimento termina:

```ts
conversation.status = CLOSED
conversation.closedAt = now()
```

---

## 12. Mensagens de Flow

Quando chegar resposta de Flow:

```ts
message.type = FLOW_REPLY
message.payload = response_json
```

Se o Flow for de cadastro:

```txt
Atualizar dados do Contact
Criar Activity
Atualizar status do contato
```

Se o Flow for de pedido:

```txt
Criar Order
Criar OrderItems
Atualizar Contact para CUSTOMER se pedido for confirmado
```

---

# Relacionamentos principais

```txt
Tenant 1:N Contact
Tenant 1:N Deal
Tenant 1:N Pipeline
Tenant 1:N Conversation

Contact 1:N Deal
Contact 1:N Conversation
Contact 1:N Message
Contact 1:N Activity
Contact N:N Tag

Conversation 1:N Message

Deal 1:N Activity

Order 1:N OrderItem
Contact 1:N Order
```

---

# Modelagem recomendada no TypeORM

## Contact Entity

```ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

export enum ContactType {
  PERSON = 'PERSON',
  COMPANY = 'COMPANY',
}

export enum LifecycleStage {
  LEAD = 'LEAD',
  MQL = 'MQL',
  SQL = 'SQL',
  OPPORTUNITY = 'OPPORTUNITY',
  CUSTOMER = 'CUSTOMER',
  INACTIVE_CUSTOMER = 'INACTIVE_CUSTOMER',
  EVANGELIST = 'EVANGELIST',
  OTHER = 'OTHER',
}

export enum ContactStatus {
  NEW = 'NEW',
  IN_SERVICE = 'IN_SERVICE',
  WAITING_CUSTOMER = 'WAITING_CUSTOMER',
  QUALIFIED = 'QUALIFIED',
  NEGOTIATION = 'NEGOTIATION',
  PROPOSAL_SENT = 'PROPOSAL_SENT',
  WON = 'WON',
  LOST = 'LOST',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

export enum ContactSource {
  WHATSAPP = 'WHATSAPP',
  INSTAGRAM = 'INSTAGRAM',
  FACEBOOK_ADS = 'FACEBOOK_ADS',
  GOOGLE_ADS = 'GOOGLE_ADS',
  WEBSITE = 'WEBSITE',
  LANDING_PAGE = 'LANDING_PAGE',
  REFERRAL = 'REFERRAL',
  MANUAL = 'MANUAL',
  IMPORTED = 'IMPORTED',
  OTHER = 'OTHER',
}

export enum LeadTemperature {
  COLD = 'COLD',
  WARM = 'WARM',
  HOT = 'HOT',
}

export enum DocumentType {
  CPF = 'CPF',
  CNPJ = 'CNPJ',
  OTHER = 'OTHER',
}

@Entity('contacts')
@Index(['tenantId', 'phone'], { unique: true })
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({
    type: 'enum',
    enum: ContactType,
    default: ContactType.PERSON,
  })
  type: ContactType;

  @Column({
    name: 'lifecycle_stage',
    type: 'enum',
    enum: LifecycleStage,
    default: LifecycleStage.LEAD,
  })
  lifecycleStage: LifecycleStage;

  @Column({
    type: 'enum',
    enum: ContactStatus,
    default: ContactStatus.NEW,
  })
  status: ContactStatus;

  @Column()
  name: string;

  @Column({ name: 'display_name', nullable: true })
  displayName: string;

  @Column({
    name: 'document_type',
    type: 'enum',
    enum: DocumentType,
    nullable: true,
  })
  documentType: DocumentType;

  @Column({ nullable: true })
  document: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  phone: string;

  @Column({ name: 'whatsapp_id', nullable: true })
  whatsappId: string;

  @Column({ name: 'company_name', nullable: true })
  companyName: string;

  @Column({ name: 'job_title', nullable: true })
  jobTitle: string;

  @Column({
    type: 'enum',
    enum: ContactSource,
    default: ContactSource.MANUAL,
  })
  source: ContactSource;

  @Column({ name: 'source_details', nullable: true })
  sourceDetails: string;

  @Column({ name: 'owner_id', type: 'uuid', nullable: true })
  ownerId: string;

  @Column({ name: 'lead_score', type: 'int', default: 0 })
  leadScore: number;

  @Column({
    type: 'enum',
    enum: LeadTemperature,
    default: LeadTemperature.COLD,
  })
  temperature: LeadTemperature;

  @Column({ name: 'first_contact_at', type: 'timestamp', nullable: true })
  firstContactAt: Date;

  @Column({ name: 'last_contact_at', type: 'timestamp', nullable: true })
  lastContactAt: Date;

  @Column({ name: 'converted_at', type: 'timestamp', nullable: true })
  convertedAt: Date;

  @Column({ name: 'lost_reason', type: 'text', nullable: true })
  lostReason: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'is_blocked', default: false })
  isBlocked: boolean;

  @Column({ name: 'is_archived', default: false })
  isArchived: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
```

---

# DTO de criação

```ts
export class CreateContactDto {
  name: string;
  phone: string;
  email?: string;
  type?: ContactType;
  documentType?: DocumentType;
  document?: string;
  companyName?: string;
  source?: ContactSource;
  sourceDetails?: string;
  ownerId?: string;
  notes?: string;
}
```

---

# Serviço: criar ou atualizar pelo WhatsApp

```ts
async findOrCreateFromWhatsapp(data: {
  tenantId: string;
  name: string;
  phone: string;
  whatsappId?: string;
}) {
  const normalizedPhone = this.normalizePhone(data.phone);

  let contact = await this.contactRepository.findOne({
    where: {
      tenantId: data.tenantId,
      phone: normalizedPhone,
    },
  });

  if (contact) {
    contact.lastContactAt = new Date();

    if (!contact.name && data.name) {
      contact.name = data.name;
    }

    if (!contact.whatsappId && data.whatsappId) {
      contact.whatsappId = data.whatsappId;
    }

    return this.contactRepository.save(contact);
  }

  contact = this.contactRepository.create({
    tenantId: data.tenantId,
    name: data.name || normalizedPhone,
    phone: normalizedPhone,
    whatsappId: data.whatsappId,
    source: ContactSource.WHATSAPP,
    lifecycleStage: LifecycleStage.LEAD,
    status: ContactStatus.NEW,
    temperature: LeadTemperature.COLD,
    leadScore: 10,
    firstContactAt: new Date(),
    lastContactAt: new Date(),
  });

  return this.contactRepository.save(contact);
}
```

---

# Serviço: converter em cliente

```ts
async convertToCustomer(contactId: string, tenantId: string) {
  const contact = await this.contactRepository.findOneOrFail({
    where: {
      id: contactId,
      tenantId,
    },
  });

  contact.lifecycleStage = LifecycleStage.CUSTOMER;
  contact.status = ContactStatus.ACTIVE;
  contact.convertedAt = contact.convertedAt || new Date();
  contact.leadScore += 100;

  return this.contactRepository.save(contact);
}
```

---

# Regras de permissão

## Tenant

Todo registro deve pertencer a um tenant.

Nenhum usuário pode acessar contatos de outro tenant.

Toda query deve filtrar por:

```ts
tenantId
```

---

## Usuário comum

Pode:

```txt
Ver contatos atribuídos a ele
Criar contato
Atualizar contato
Criar atividade
Responder conversa
```

---

## Admin

Pode:

```txt
Ver todos os contatos
Excluir contato
Transferir responsável
Criar pipelines
Gerenciar usuários
Exportar dados
```

---

# Eventos automáticos recomendados

```txt
contact.created
contact.updated
contact.converted_to_customer
deal.created
deal.won
deal.lost
conversation.created
message.received
message.sent
order.created
order.confirmed
```

---

# Recomendação final

Para seu CRM, eu usaria esta estrutura:

```txt
Contact
Deal
Pipeline
PipelineStage
Conversation
Message
Activity
Tag
Order
OrderItem
```

E a regra principal seria:

```txt
Lead e Cliente são estados do Contact.
A conversão acontece quando existe venda, pedido confirmado ou negócio ganho.
```

Isso deixa o sistema mais profissional, evita duplicidade e permite histórico completo do relacionamento.
