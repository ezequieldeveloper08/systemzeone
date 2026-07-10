import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpStatus, HttpCode, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import ffmpeg from 'fluent-ffmpeg';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { TenantGuard } from '../../../auth/infrastructure/guards/tenant.guard';
import { CurrentTenant } from '../../../auth/presentation/decorators/current-tenant.decorator';
import { ListVehiclesUseCase } from '../../application/use-cases/list-vehicles.use-case';
import { GetVehicleUseCase } from '../../application/use-cases/get-vehicle.use-case';
import { CreateVehicleUseCase } from '../../application/use-cases/create-vehicle.use-case';
import { UpdateVehicleUseCase } from '../../application/use-cases/update-vehicle.use-case';
import { DeleteVehicleUseCase } from '../../application/use-cases/delete-vehicle.use-case';
import { CreateVehicleDto } from '../dtos/create-vehicle.dto';
import { UpdateVehicleDto } from '../dtos/update-vehicle.dto';

// Set path for self-contained ffmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

// Transcoding function to guarantee valid OGG/Opus for WhatsApp (mono, 16kHz)
async function transcodeOggToOpus(filePath: string): Promise<void> {
  const tempPath = filePath + '.temp.ogg';
  fs.renameSync(filePath, tempPath);

  return new Promise<void>((resolve, reject) => {
    ffmpeg(tempPath)
      .audioCodec('libopus')
      .audioChannels(1) // WhatsApp requires mono channels
      .audioFrequency(16000) // standard voice rate
      .save(filePath)
      .on('end', () => {
        try {
          fs.unlinkSync(tempPath);
        } catch (e) {}
        resolve();
      })
      .on('error', (err) => {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          fs.renameSync(tempPath, filePath);
        } catch (e) {}
        reject(err);
      });
  });
}

@ApiTags('Vehicles')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  required: true,
  description: 'ID da Concessionária (Tenant) ativa do usuário',
})
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('vehicles')
export class VehicleController {
  constructor(
    private readonly listVehiclesUseCase: ListVehiclesUseCase,
    private readonly getVehicleUseCase: GetVehicleUseCase,
    private readonly createVehicleUseCase: CreateVehicleUseCase,
    private readonly updateVehicleUseCase: UpdateVehicleUseCase,
    private readonly deleteVehicleUseCase: DeleteVehicleUseCase,
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
  @ApiOperation({ summary: 'Fazer upload de imagem do veículo' })
  async uploadFile(@UploadedFile() file: any, @Req() req: any) {
    // If it's an ogg file, transcode it to valid Opus mono container for Meta
    if (file.filename.endsWith('.ogg')) {
      try {
        await transcodeOggToOpus(file.path);
      } catch (err) {
        console.error('Falha ao converter áudio ogg para opus:', err);
      }
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/uploads/${file.filename}`;
    return { url: fileUrl };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os veículos da concessionária' })
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('type') type?: string,
    @Query('brand') brand?: string,
    @Query('status') status?: string,
  ) {
    return this.listVehiclesUseCase.execute(tenantId, { type, brand, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um veículo' })
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.getVehicleUseCase.execute(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo veículo' })
  async create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateVehicleDto,
  ) {
    return this.createVehicleUseCase.execute(tenantId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar informações de um veículo' })
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.updateVehicleUseCase.execute(tenantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um veículo' })
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.deleteVehicleUseCase.execute(tenantId, id);
  }
}
