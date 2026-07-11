import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IsString, IsOptional, IsNumber, IsIn, Min, Max } from 'class-validator';
import { ITableRepositoryToken } from '../../domain/repositories/table.repository.interface';
import type { ITableRepository } from '../../domain/repositories/table.repository.interface';
import { Table } from '../../domain/entities/table.entity';

export class UpdateTableDto {
  @IsString()
  @IsOptional()
  number?: string;

  @IsNumber()
  @Min(1)
  @Max(50)
  @IsOptional()
  capacity?: number;

  @IsString()
  @IsIn(['free', 'occupied', 'reserved'])
  @IsOptional()
  status?: 'free' | 'occupied' | 'reserved';

  @IsString()
  @IsOptional()
  label?: string;
}

@Injectable()
export class UpdateTableUseCase {
  constructor(
    @Inject(ITableRepositoryToken)
    private readonly tableRepository: ITableRepository,
  ) {}

  async execute(tenantId: string, id: string, dto: UpdateTableDto): Promise<Table> {
    const table = await this.tableRepository.findById(tenantId, id);
    if (!table) throw new NotFoundException('Mesa não encontrada.');

    if (dto.number !== undefined) table.number = dto.number;
    if (dto.capacity !== undefined) table.capacity = dto.capacity;
    if (dto.status !== undefined) table.status = dto.status;
    if (dto.label !== undefined) table.label = dto.label || null;

    return this.tableRepository.save(table);
  }
}
