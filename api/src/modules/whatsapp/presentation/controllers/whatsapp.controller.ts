import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { TenantGuard } from '../../../auth/infrastructure/guards/tenant.guard';
import { CurrentTenant } from '../../../auth/presentation/decorators/current-tenant.decorator';
import { GetWhatsappSettingsUseCase } from '../../application/use-cases/get-whatsapp-settings.use-case';
import { SaveWhatsappSettingsUseCase } from '../../application/use-cases/save-whatsapp-settings.use-case';
import { GetWhatsappTemplatesUseCase } from '../../application/use-cases/get-whatsapp-templates.use-case';
import { SyncWhatsappTemplatesUseCase } from '../../application/use-cases/sync-whatsapp-templates.use-case';
import { SendTemplateMessageUseCase } from '../../application/use-cases/send-template-message.use-case';
import { SendFreeTextMessageUseCase } from '../../application/use-cases/send-free-text-message.use-case';
import { GetChatsUseCase } from '../../application/use-cases/get-chats.use-case';
import { GetChatMessagesUseCase } from '../../application/use-cases/get-chat-messages.use-case';
import { GetWhatsappLogsUseCase } from '../../application/use-cases/get-whatsapp-logs.use-case';
import { CreateWhatsappTemplateUseCase } from '../../application/use-cases/create-whatsapp-template.use-case';
import { DeleteWhatsappTemplateUseCase } from '../../application/use-cases/delete-whatsapp-template.use-case';
import { GetWhatsappFlowsUseCase } from '../../application/use-cases/get-whatsapp-flows.use-case';
import { GetWhatsappFlowByIdUseCase } from '../../application/use-cases/get-whatsapp-flow-by-id.use-case';
import { SaveWhatsappFlowUseCase } from '../../application/use-cases/save-whatsapp-flow.use-case';
import { DeleteWhatsappFlowUseCase } from '../../application/use-cases/delete-whatsapp-flow.use-case';
import { GetWhatsappFlowResponsesUseCase } from '../../application/use-cases/get-flow-responses.use-case';
import { SendFlowMessageUseCase } from '../../application/use-cases/send-flow-message.use-case';
import { SyncWhatsappFlowsUseCase } from '../../application/use-cases/sync-whatsapp-flows.use-case';
import { SaveSettingsDto } from '../dtos/save-settings.dto';
import { SendTemplateDto } from '../dtos/send-template.dto';
import { SendMessageDto } from '../dtos/send-message.dto';
import { CreateTemplateDto } from '../dtos/create-template.dto';
import { SaveFlowDto } from '../dtos/save-flow.dto';
import { SendFlowMessageDto } from '../dtos/send-flow-message.dto';
import { PauseAiUseCase } from '../../application/use-cases/pause-ai.use-case';
import { ResumeAiUseCase } from '../../application/use-cases/resume-ai.use-case';
import { RevokeWhatsappMessageUseCase } from '../../application/use-cases/revoke-whatsapp-message.use-case';
import { ExchangeMetaCodeUseCase } from '../../application/use-cases/exchange-meta-code.use-case';
import { ExchangeCodeDto } from '../dtos/exchange-code.dto';

@ApiTags('WhatsApp Business API')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  required: true,
  description: 'ID da Concessionária (Tenant) ativa do usuário',
})
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly getSettingsUseCase: GetWhatsappSettingsUseCase,
    private readonly saveSettingsUseCase: SaveWhatsappSettingsUseCase,
    private readonly getTemplatesUseCase: GetWhatsappTemplatesUseCase,
    private readonly syncTemplatesUseCase: SyncWhatsappTemplatesUseCase,
    private readonly sendTemplateUseCase: SendTemplateMessageUseCase,
    private readonly sendFreeTextUseCase: SendFreeTextMessageUseCase,
    private readonly getChatsUseCase: GetChatsUseCase,
    private readonly getMessagesUseCase: GetChatMessagesUseCase,
    private readonly getLogsUseCase: GetWhatsappLogsUseCase,
    private readonly createTemplateUseCase: CreateWhatsappTemplateUseCase,
    private readonly deleteTemplateUseCase: DeleteWhatsappTemplateUseCase,
    private readonly getFlowsUseCase: GetWhatsappFlowsUseCase,
    private readonly getFlowByIdUseCase: GetWhatsappFlowByIdUseCase,
    private readonly saveFlowUseCase: SaveWhatsappFlowUseCase,
    private readonly deleteFlowUseCase: DeleteWhatsappFlowUseCase,
    private readonly getFlowResponsesUseCase: GetWhatsappFlowResponsesUseCase,
    private readonly sendFlowMessageUseCase: SendFlowMessageUseCase,
    private readonly syncFlowsUseCase: SyncWhatsappFlowsUseCase,
    private readonly pauseAiUseCase: PauseAiUseCase,
    private readonly resumeAiUseCase: ResumeAiUseCase,
    private readonly revokeMessageUseCase: RevokeWhatsappMessageUseCase,
    private readonly exchangeMetaCodeUseCase: ExchangeMetaCodeUseCase,
  ) {}

  @Get('settings')
  @ApiOperation({ summary: 'Obter configurações de integração da Meta' })
  async getSettings(@CurrentTenant() tenantId: string) {
    return this.getSettingsUseCase.execute(tenantId);
  }

  @Post('settings')
  @ApiOperation({ summary: 'Salvar/Atualizar credenciais de integração da Meta' })
  async saveSettings(
    @CurrentTenant() tenantId: string,
    @Body() dto: SaveSettingsDto,
  ) {
    return this.saveSettingsUseCase.execute(tenantId, dto);
  }

  @Post('embedded-signup')
  @ApiOperation({ summary: 'Trocar código de autenticação do Embedded Signup da Meta e registrar WABA' })
  async connectEmbeddedSignup(
    @CurrentTenant() tenantId: string,
    @Body() dto: ExchangeCodeDto,
  ) {
    return this.exchangeMetaCodeUseCase.execute(tenantId, dto.code);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Obter modelos (templates) cadastrados' })
  async getTemplates(@CurrentTenant() tenantId: string) {
    return this.getTemplatesUseCase.execute(tenantId);
  }

  @Post('templates')
  @ApiOperation({ summary: 'Criar novo modelo de mensagem oficial na Meta' })
  async createTemplate(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateTemplateDto,
  ) {
    return this.createTemplateUseCase.execute(tenantId, dto);
  }

  @Delete('templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover modelo de mensagem oficial da Meta' })
  async deleteTemplate(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.deleteTemplateUseCase.execute(tenantId, id);
  }

  @Post('templates/sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sincronizar modelos diretamente da Meta Cloud API' })
  async syncTemplates(@CurrentTenant() tenantId: string) {
    return this.syncTemplatesUseCase.execute(tenantId);
  }

  @Post('send-template')
  @ApiOperation({ summary: 'Disparar mensagem ativa utilizando modelo da Meta' })
  async sendTemplate(
    @CurrentTenant() tenantId: string,
    @Body() dto: SendTemplateDto,
  ) {
    return this.sendTemplateUseCase.execute(tenantId, dto);
  }

  @Post('send-message')
  @ApiOperation({ summary: 'Enviar mensagem de texto livre no Chat Ao Vivo' })
  async sendMessage(
    @CurrentTenant() tenantId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.sendFreeTextUseCase.execute(tenantId, dto);
  }

  @Get('chats')
  @ApiOperation({ summary: 'Listar conversas ativas no Chat Ao Vivo' })
  async getChats(@CurrentTenant() tenantId: string) {
    return this.getChatsUseCase.execute(tenantId);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Listar todos os logs de envio do WhatsApp' })
  async getLogs(@CurrentTenant() tenantId: string) {
    return this.getLogsUseCase.execute(tenantId);
  }

  @Get('chats/:phone/messages')
  @ApiOperation({ summary: 'Obter histórico de mensagens de uma conversa' })
  async getMessages(
    @CurrentTenant() tenantId: string,
    @Param('phone') phone: string,
  ) {
    return this.getMessagesUseCase.execute(tenantId, phone);
  }

  // --- WHATSAPP FLOWS ROUTES ---

  @Get('flows')
  @ApiOperation({ summary: 'Listar todos os fluxos da concessionária' })
  async getFlows(@CurrentTenant() tenantId: string) {
    return this.getFlowsUseCase.execute(tenantId);
  }

  @Post('flows/sync')
  @ApiOperation({ summary: 'Sincronizar fluxos (Flows) com a conta Meta' })
  async syncFlows(@CurrentTenant() tenantId: string) {
    return this.syncFlowsUseCase.execute(tenantId);
  }

  @Get('flows/responses')
  @ApiOperation({ summary: 'Obter respostas/submissões dos fluxos' })
  async getFlowResponses(
    @CurrentTenant() tenantId: string,
    @Query('flowId') flowId?: string,
  ) {
    return this.getFlowResponsesUseCase.execute(tenantId, flowId);
  }

  @Get('flows/:id')
  @ApiOperation({ summary: 'Obter detalhes de um fluxo específico' })
  async getFlowById(@Param('id') id: string) {
    return this.getFlowByIdUseCase.execute(id);
  }

  @Post('flows')
  @ApiOperation({ summary: 'Criar ou atualizar um fluxo' })
  async saveFlow(
    @CurrentTenant() tenantId: string,
    @Body() dto: SaveFlowDto,
  ) {
    return this.saveFlowUseCase.execute(tenantId, dto);
  }

  @Delete('flows/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir um fluxo' })
  async deleteFlow(@Param('id') id: string) {
    return this.deleteFlowUseCase.execute(id);
  }

  @Post('flows/send')
  @ApiOperation({ summary: 'Disparar mensagem com botão para abrir o Fluxo' })
  async sendFlowMessage(
    @CurrentTenant() tenantId: string,
    @Body() dto: SendFlowMessageDto,
  ) {
    return this.sendFlowMessageUseCase.execute(tenantId, dto);
  }

  @Post('chats/:phone/pause-ai')
  @ApiOperation({ summary: 'Pausar respostas da IA para um telefone específico' })
  async pauseAi(
    @CurrentTenant() tenantId: string,
    @Param('phone') phone: string,
  ) {
    return this.pauseAiUseCase.execute(tenantId, phone);
  }

  @Post('chats/:phone/resume-ai')
  @ApiOperation({ summary: 'Retomar respostas da IA para um telefone específico' })
  async resumeAi(
    @CurrentTenant() tenantId: string,
    @Param('phone') phone: string,
  ) {
    return this.resumeAiUseCase.execute(tenantId, phone);
  }

  @Post('messages/:id/revoke')
  @ApiOperation({ summary: 'Apagar/revogar uma mensagem enviada' })
  async revokeMessage(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.revokeMessageUseCase.execute(tenantId, id);
  }
}
