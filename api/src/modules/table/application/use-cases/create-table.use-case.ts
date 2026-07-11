import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsIn, Min, Max } from 'class-validator';
import { ITableRepositoryToken } from '../../domain/repositories/table.repository.interface';
import type { ITableRepository } from '../../domain/repositories/table.repository.interface';
import { Table } from '../../domain/entities/table.entity';

export class CreateTableDto {
  @IsString()
  @IsNotEmpty()
  number: string;

  @IsNumber()
  @Min(1)
  @Max(50)
  capacity: number;

  @IsString()
  @IsIn(['free', 'occupied', 'reserved'])
  @IsOptional()
  status?: 'free' | 'occupied' | 'reserved';

  @IsString()
  @IsOptional()
  label?: string;
}

@Injectable()
export class CreateTableUseCase {
  constructor(
    @Inject(ITableRepositoryToken)
    private readonly tableRepository: ITableRepository,
  ) {}

  async execute(tenantId: string, dto: CreateTableDto): Promise<Table> {
    const table = new Table(
      crypto.randomUUID(),
      tenantId,
      dto.number,
      dto.capacity,
      dto.status || 'free',
      dto.label || null,
      new Date(),
      new Date(),
    );
    return this.tableRepository.save(table);
  }
}
