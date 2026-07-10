import { 
  IsNotEmpty, 
  IsString, 
  IsNumber, 
  IsEnum, 
  IsOptional, 
  IsUUID, 
  IsDateString 
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ example: 'Venda do Chevrolet Onix 2020', description: 'Descrição da transação' })
  @IsString()
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  description: string;

  @ApiProperty({ example: 45000.00, description: 'Valor da transação' })
  @IsNumber({}, { message: 'O valor deve ser um número' })
  @IsNotEmpty({ message: 'O valor é obrigatório' })
  amount: number;

  @ApiProperty({ example: 'revenue', enum: ['revenue', 'expense'], description: 'Tipo da transação' })
  @IsEnum(['revenue', 'expense'], { message: 'O tipo deve ser "revenue" ou "expense"' })
  @IsNotEmpty({ message: 'O tipo é obrigatório' })
  type: 'revenue' | 'expense';

  @ApiProperty({ example: 'pending', enum: ['pending', 'paid'], description: 'Status de pagamento' })
  @IsEnum(['pending', 'paid'], { message: 'O status deve ser "pending" ou "paid"' })
  @IsOptional()
  status?: 'pending' | 'paid';

  @ApiProperty({ example: '2026-06-30T00:00:00.000Z', description: 'Data de vencimento' })
  @IsDateString({}, { message: 'Data de vencimento inválida' })
  @IsNotEmpty({ message: 'A data de vencimento é obrigatória' })
  dueDate: string;

  @ApiProperty({ example: '2026-06-18T00:00:00.000Z', description: 'Data de pagamento', required: false })
  @IsDateString({}, { message: 'Data de pagamento inválida' })
  @IsOptional()
  paymentDate?: string;

  @ApiProperty({ example: 'venda', description: 'Categoria da transação', default: 'outros' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'ID do veículo relacionado', required: false })
  @IsUUID('4', { message: 'ID de veículo inválido' })
  @IsOptional()
  vehicleId?: string;
}
