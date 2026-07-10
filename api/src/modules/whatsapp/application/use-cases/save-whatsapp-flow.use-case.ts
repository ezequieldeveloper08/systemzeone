import { Inject, Injectable } from '@nestjs/common';
import { IWhatsappRepositoryToken } from '../../domain/repositories/whatsapp.repository.interface';
import type { IWhatsappRepository } from '../../domain/repositories/whatsapp.repository.interface';
import { WhatsappFlow } from '../../domain/entities/whatsapp-flow.entity';
import { MetaWhatsappService } from '../../infrastructure/services/meta-whatsapp.service';
import * as crypto from 'crypto';

interface SaveFlowDto {
  id?: string;
  name: string;
  flowId?: string | null;
  status?: 'draft' | 'published' | 'deprecated';
  categories?: string[];
  screens: Record<string, any>;
}

@Injectable()
export class SaveWhatsappFlowUseCase {
  constructor(
    @Inject(IWhatsappRepositoryToken)
    private readonly whatsappRepository: IWhatsappRepository,
    private readonly metaWhatsappService: MetaWhatsappService,
  ) {}

  async execute(tenantId: string, dto: SaveFlowDto): Promise<WhatsappFlow> {
    const settings = await this.whatsappRepository.findSettingsByTenantId(tenantId);
    let flow: WhatsappFlow | null = null;

    if (dto.id) {
      flow = await this.whatsappRepository.findFlowById(dto.id);
    }

    const isNew = !flow;
    const previousStatus = flow?.status || 'draft';

    if (!flow) {
      flow = new WhatsappFlow(
        dto.id || crypto.randomUUID(),
        tenantId,
        dto.name,
        dto.flowId || null,
        dto.status || 'draft',
        dto.categories || ['lead_generation'],
        dto.screens,
        new Date(),
        new Date(),
      );
    } else {
      flow.name = dto.name;
      flow.status = dto.status || flow.status;
      flow.categories = dto.categories || flow.categories;
      flow.screens = dto.screens;
      flow.flowId = dto.flowId !== undefined ? dto.flowId : flow.flowId;
      flow.updatedAt = new Date();
    }

    // If WhatsApp credentials are set, sync metadata & layouts with Meta API
    if (settings) {
      try {
        // 1. If it has no flowId on Meta, create the flow container shell
        if (!flow.flowId) {
          const categoryMeta = flow.categories?.[0] 
            ? flow.categories[0].toUpperCase() 
            : 'LEAD_GENERATION';
          const metaResult = await this.metaWhatsappService.createFlow(
            settings,
            flow.name,
            categoryMeta,
          );
          flow.flowId = metaResult.id;
        }

        // 2. Upload layout JSON as asset
        const metaLayoutJson = this.compileMetaFlowJson(flow.screens);
        await this.metaWhatsappService.updateFlowLayout(
          settings,
          flow.flowId,
          metaLayoutJson,
        );

        // 3. If published is requested and it was in draft, publish it on Meta
        if (flow.status === 'published' && previousStatus !== 'published') {
          await this.metaWhatsappService.publishFlow(settings, flow.flowId);
        }
      } catch (metaError) {
        // Log error but do not block saving locally so that drafts are not lost
        console.error('Falha na comunicação com a API da Meta ao salvar fluxo:', metaError);
      }
    }

    const saved = await this.whatsappRepository.saveFlow(flow);
    return saved;
  }

  private compileMetaFlowJson(screens: Record<string, any>): any {
    const getPayloadForScreen = (currentScreenKey: string) => {
      const payload: Record<string, string> = {};
      Object.entries(screens || {}).forEach(([sKey, sConf]: [string, any]) => {
        (sConf.fields || []).forEach((f: any) => {
          const isInput = ['TextInput', 'TextArea', 'Dropdown', 'RadioButtonsGroup', 'CheckboxGroup', 'DatePicker'].includes(f.type);
          if (isInput) {
            const name = f.name || f.id;
            if (sKey === currentScreenKey) {
              payload[name] = `\${form.${name}}`;
            } else {
              payload[name] = `\${data.${name}}`;
            }
          }
        });
      });
      return payload;
    };

    const metaLayout: Record<string, any> = {
      version: '7.3',
      screens: [],
    };

    const screensKeys = Object.keys(screens);

    Object.entries(screens).forEach(([screenKey, screenConfig]: [string, any]) => {
      const layoutChildren: any[] = [];

      // Determine if screen has a valid transition to another existing screen key
      let hasNextValidScreen = false;
      const screenNext = screenConfig.next_screen || screenConfig.nextScreen;
      if (screenNext && screensKeys.includes(screenNext) && screenNext !== screenKey) {
        hasNextValidScreen = true;
      }

      (screenConfig.fields || []).forEach((field: any) => {
        if ((field.type === 'FooterButton' || field.type === 'NavigationAction') && field.actionType === 'navigate' && field.nextScreen) {
          if (screensKeys.includes(field.nextScreen) && field.nextScreen !== screenKey) {
            hasNextValidScreen = true;
          }
        }
      });

      const isTerminal = !!screenConfig.finish || screensKeys.length === 1 || !hasNextValidScreen;

      (screenConfig.fields || []).forEach((field: any) => {
        let metaField: any = {};

        if (field.type === 'TextHeading') {
          metaField = {
            type: 'TextHeading',
            text: field.label ? field.label.substring(0, 80) : '',
          };
        } else if (field.type === 'TextSubheading') {
          metaField = {
            type: 'TextSubheading',
            text: field.label ? field.label.substring(0, 80) : '',
          };
        } else if (field.type === 'TextBody') {
          metaField = {
            type: 'TextBody',
            text: field.label ? field.label.substring(0, 4096) : '',
            markdown: field.markdown ? true : undefined,
          };
        } else if (field.type === 'TextCaption') {
          metaField = {
            type: 'TextCaption',
            text: field.label ? field.label.substring(0, 4096) : '',
            markdown: field.markdown ? true : undefined,
          };
        } else if (field.type === 'TextInput') {
          metaField = {
            type: 'TextInput',
            name: field.name || field.id,
            label: field.label ? field.label.substring(0, 20) : '',
            required: !!field.required,
            'helper-text': field.helperText ? field.helperText.substring(0, 80) : (field.regex ? 'Formato requerido' : undefined),
            'input-type': field.inputType || 'text',
          };
          if (field.regex) {
            metaField.pattern = field.regex;
          }
        } else if (field.type === 'TextArea') {
          metaField = {
            type: 'TextArea',
            name: field.name || field.id,
            label: field.label ? field.label.substring(0, 20) : '',
            required: !!field.required,
            'helper-text': field.helperText ? field.helperText.substring(0, 80) : undefined,
            'max-length': field.maxLength || field.maxChars || 600,
          };
        } else if (field.type === 'Dropdown') {
          metaField = {
            type: 'Dropdown',
            name: field.name || field.id,
            label: field.label ? field.label.substring(0, 20) : '',
            required: !!field.required,
            'helper-text': field.helperText ? field.helperText.substring(0, 80) : undefined,
            'data-source': (field.options || []).map((o: string) => ({ id: o, title: o.substring(0, 30) })),
          };
        } else if (field.type === 'RadioButtonsGroup') {
          metaField = {
            type: 'RadioButtonsGroup',
            name: field.name || field.id,
            label: field.label ? field.label.substring(0, 20) : '',
            required: !!field.required,
            'helper-text': field.helperText ? field.helperText.substring(0, 80) : undefined,
            'data-source': (field.options || []).map((o: string) => ({ id: o, title: o.substring(0, 30) })),
          };
        } else if (field.type === 'CheckboxGroup') {
          metaField = {
            type: 'CheckboxGroup',
            name: field.name || field.id,
            label: field.label ? field.label.substring(0, 20) : '',
            required: !!field.required,
            'helper-text': field.helperText ? field.helperText.substring(0, 80) : undefined,
            'data-source': (field.options || []).map((o: string) => ({ id: o, title: o.substring(0, 30) })),
          };
        } else if (field.type === 'DatePicker') {
          metaField = {
            type: 'CalendarPicker',
            name: field.name || field.id,
            label: field.label ? field.label.substring(0, 20) : '',
            required: !!field.required,
            'helper-text': field.helperText ? field.helperText.substring(0, 80) : undefined,
          };
        } else if (field.type === 'Image') {
          metaField = {
            type: 'Image',
            src: field.imageUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341',
            'scale-type': 'fit-width',
          };
        } else if (field.type === 'FooterButton') {
          let actionType = field.actionType || 'navigate';
          // Convert navigate to complete if target is missing/invalid
          if (actionType === 'navigate' && (!field.nextScreen || !screensKeys.includes(field.nextScreen) || field.nextScreen === screenKey)) {
            actionType = 'complete';
          }

          const clickAction: Record<string, any> = { name: actionType };

          if (actionType === 'navigate' && field.nextScreen) {
            clickAction.next = { type: 'screen', name: field.nextScreen };
            clickAction.payload = getPayloadForScreen(screenKey);
          } else if (actionType === 'complete') {
            clickAction.payload = getPayloadForScreen(screenKey);
          } else if (actionType === 'data_exchange') {
            clickAction.payload = {
              screen: screenKey,
              ...getPayloadForScreen(screenKey),
            };
          }

          metaField = {
            type: 'Footer',
            label: field.label || 'Avançar',
            'on-click-action': clickAction,
          };
        }

        if (field.type === 'NavigationAction') {
          const isNavValid = field.nextScreen && screensKeys.includes(field.nextScreen) && field.nextScreen !== screenKey;
          metaField = {
            type: 'Footer',
            label: field.label || 'Avançar',
            'on-click-action': isNavValid ? {
              name: 'navigate',
              next: { type: 'screen', name: field.nextScreen },
              payload: getPayloadForScreen(screenKey),
            } : {
              name: 'complete',
              payload: getPayloadForScreen(screenKey),
            },
          };
        } else if (field.type === 'DataExchangeAction') {
          metaField = {
            type: 'Footer',
            label: field.label || 'Avançar',
            'on-click-action': {
              name: 'data_exchange',
              payload: {
                screen: screenKey,
                ...getPayloadForScreen(screenKey),
              },
            },
          };
        }

        if (metaField.type) {
          layoutChildren.push(metaField);
        }
      });

      const hasFooter = layoutChildren.some(c => c.type === 'Footer');
      if (!hasFooter) {
        const fallbackAction = isTerminal ? 'complete' : 'navigate';
        const targetScreen = screenNext && screensKeys.includes(screenNext) && screenNext !== screenKey
          ? screenNext
          : (screensKeys.find(k => k !== screenKey) || 'success_screen');

        layoutChildren.push({
          type: 'Footer',
          label: isTerminal ? 'Concluir' : 'Avançar',
          'on-click-action': {
            name: fallbackAction,
            ...(fallbackAction === 'complete'
              ? { payload: getPayloadForScreen(screenKey) }
              : {
                  next: { type: 'screen', name: targetScreen },
                  payload: getPayloadForScreen(screenKey),
                }),
          },
        });
      }

      metaLayout.screens.push({
        id: screenKey,
        title: screenConfig.title || 'Tela',
        terminal: isTerminal,
        layout: {
          type: 'SingleColumnLayout',
          children: layoutChildren,
        },
      });
    });

    return metaLayout;
  }
}
