import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { TenantGuard } from '../../../auth/infrastructure/guards/tenant.guard';
import { CurrentTenant } from '../../../auth/presentation/decorators/current-tenant.decorator';
import { ListPropertiesUseCase } from '../../application/use-cases/list-properties.use-case';
import { CreatePropertyUseCase } from '../../application/use-cases/create-property.use-case';
import { GetPropertyUseCase } from '../../application/use-cases/get-property.use-case';
import { UpdatePropertyUseCase } from '../../application/use-cases/update-property.use-case';
import { DeletePropertyUseCase } from '../../application/use-cases/delete-property.use-case';
import { CreatePropertyDto } from '../dtos/create-property.dto';
import { UpdatePropertyDto } from '../dtos/update-property.dto';

@ApiTags('RealEstate')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  required: true,
  description: 'ID do Tenant ativo do usuário',
})
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('real-estate')
export class RealEstateController {
  constructor(
    private readonly listPropertiesUseCase: ListPropertiesUseCase,
    private readonly createPropertyUseCase: CreatePropertyUseCase,
    private readonly getPropertyUseCase: GetPropertyUseCase,
    private readonly updatePropertyUseCase: UpdatePropertyUseCase,
    private readonly deletePropertyUseCase: DeletePropertyUseCase,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = crypto.randomUUID();
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Fazer upload de imagem do imóvel' })
  async uploadFile(@UploadedFile() file: any, @Req() req: any) {
    const protocol = req.protocol;
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/uploads/${file.filename}`;
    return { url: fileUrl };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os imóveis do tenant' })
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.listPropertiesUseCase.execute(tenantId, { type, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um imóvel' })
  async findById(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.getPropertyUseCase.execute(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo imóvel' })
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreatePropertyDto,
  ) {
    return this.createPropertyUseCase.execute(tenantId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar dados de um imóvel' })
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
  ) {
    return this.updatePropertyUseCase.execute(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um imóvel' })
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.deletePropertyUseCase.execute(tenantId, id);
  }
}
