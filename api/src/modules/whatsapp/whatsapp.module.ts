import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { WhatsappSettingsOrmEntity } from './infrastructure/database/whatsapp-settings.orm-entity';
import { WhatsappTemplateOrmEntity } from './infrastructure/database/whatsapp-template.orm-entity';
import { WhatsappLogOrmEntity } from './infrastructure/database/whatsapp-log.orm-entity';
import { WhatsappFlowOrmEntity } from './infrastructure/database/whatsapp-flow.orm-entity';
import { WhatsappFlowResponseOrmEntity } from './infrastructure/database/whatsapp-flow-response.orm-entity';
import { WhatsappRepository } from './infrastructure/repositories/whatsapp.repository';
import { IWhatsappRepositoryToken } from './domain/repositories/whatsapp.repository.interface';
import { MetaWhatsappService } from './infrastructure/services/meta-whatsapp.service';
import { GetWhatsappSettingsUseCase } from './application/use-cases/get-whatsapp-settings.use-case';
import { SaveWhatsappSettingsUseCase } from './application/use-cases/save-whatsapp-settings.use-case';
import { GetWhatsappTemplatesUseCase } from './application/use-cases/get-whatsapp-templates.use-case';
import { SyncWhatsappTemplatesUseCase } from './application/use-cases/sync-whatsapp-templates.use-case';
import { SendTemplateMessageUseCase } from './application/use-cases/send-template-message.use-case';
import { SendFreeTextMessageUseCase } from './application/use-cases/send-free-text-message.use-case';
import { GetChatsUseCase } from './application/use-cases/get-chats.use-case';
import { GetChatMessagesUseCase } from './application/use-cases/get-chat-messages.use-case';
import { GetWhatsappLogsUseCase } from './application/use-cases/get-whatsapp-logs.use-case';
import { HandleMetaWebhookUseCase } from './application/use-cases/handle-meta-webhook.use-case';
import { CreateWhatsappTemplateUseCase } from './application/use-cases/create-whatsapp-template.use-case';
import { DeleteWhatsappTemplateUseCase } from './application/use-cases/delete-whatsapp-template.use-case';
import { GetWhatsappFlowsUseCase } from './application/use-cases/get-whatsapp-flows.use-case';
import { GetWhatsappFlowByIdUseCase } from './application/use-cases/get-whatsapp-flow-by-id.use-case';
import { SaveWhatsappFlowUseCase } from './application/use-cases/save-whatsapp-flow.use-case';
import { DeleteWhatsappFlowUseCase } from './application/use-cases/delete-whatsapp-flow.use-case';
import { GetWhatsappFlowResponsesUseCase } from './application/use-cases/get-flow-responses.use-case';
import { SendFlowMessageUseCase } from './application/use-cases/send-flow-message.use-case';
import { HandleWhatsappFlowWebhookUseCase } from './application/use-cases/handle-flow-webhook.use-case';
import { SyncWhatsappFlowsUseCase } from './application/use-cases/sync-whatsapp-flows.use-case';
import { WhatsappController } from './presentation/controllers/whatsapp.controller';
import { WhatsappWebhookController } from './presentation/controllers/whatsapp-webhook.controller';
import { PauseAiUseCase } from './application/use-cases/pause-ai.use-case';
import { ResumeAiUseCase } from './application/use-cases/resume-ai.use-case';
import { RevokeWhatsappMessageUseCase } from './application/use-cases/revoke-whatsapp-message.use-case';

import { CrmModule } from '../crm/crm.module';
import { VehicleModule } from '../vehicle/vehicle.module';
import { RealEstateModule } from '../real-estate/real-estate.module';
import { MenuModule } from '../menu/menu.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    AuthModule,
    CrmModule,
    VehicleModule,
    RealEstateModule,
    MenuModule,
    OrderModule,
    TypeOrmModule.forFeature([
      WhatsappSettingsOrmEntity,
      WhatsappTemplateOrmEntity,
      WhatsappLogOrmEntity,
      WhatsappFlowOrmEntity,
      WhatsappFlowResponseOrmEntity,
    ]),
  ],
  providers: [
    {
      provide: IWhatsappRepositoryToken,
      useClass: WhatsappRepository,
    },
    MetaWhatsappService,
    GetWhatsappSettingsUseCase,
    SaveWhatsappSettingsUseCase,
    GetWhatsappTemplatesUseCase,
    SyncWhatsappTemplatesUseCase,
    SendTemplateMessageUseCase,
    SendFreeTextMessageUseCase,
    GetChatsUseCase,
    GetChatMessagesUseCase,
    GetWhatsappLogsUseCase,
    HandleMetaWebhookUseCase,
    CreateWhatsappTemplateUseCase,
    DeleteWhatsappTemplateUseCase,
    GetWhatsappFlowsUseCase,
    GetWhatsappFlowByIdUseCase,
    SaveWhatsappFlowUseCase,
    DeleteWhatsappFlowUseCase,
    GetWhatsappFlowResponsesUseCase,
    SendFlowMessageUseCase,
    HandleWhatsappFlowWebhookUseCase,
    SyncWhatsappFlowsUseCase,
    PauseAiUseCase,
    ResumeAiUseCase,
    RevokeWhatsappMessageUseCase,
  ],
  controllers: [WhatsappController, WhatsappWebhookController],
  exports: [IWhatsappRepositoryToken],
})
export class WhatsappModule {}
