import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { TransactionType } from '../type/transactions-type.enum';
import { Transform } from 'class-transformer';

export class CreateTransactionDto {
  @IsEnum(TransactionType, {
    message: 'O campo "type" deve ser um valor válido.',
  })
  @IsNotEmpty({ message: 'O campo "type" é obrigatório.' })
  type: TransactionType;

  @IsNumber({}, { message: 'O campo "value" deve ser um número válido.' })
  @IsNotEmpty({ message: 'O campo "value" é obrigatório.' })
  value: number;

  @IsString({ message: 'O campo "cpf" deve ser uma string.' })
  @IsNotEmpty({ message: 'O campo "cpf" é obrigatório.' })
  cpf: string;

  @IsString({ message: 'O campo "card" deve ser uma string.' })
  @IsNotEmpty({ message: 'O campo "card" é obrigatório.' })
  card: string;

  @IsNotEmpty({ message: 'O campo "timeOfOccurrence" é obrigatório.' })
  @Transform(({ value }) => new Date(value))
  timeOfOccurrence: Date;

  @IsString({ message: 'O campo "shopOwner" deve ser uma string.' })
  @IsNotEmpty({ message: 'O campo "shopOwner" é obrigatório.' })
  shopOwner: string;

  @IsString({ message: 'O campo "shopName" deve ser uma string.' })
  @IsNotEmpty({ message: 'O campo "shopName" é obrigatório.' })
  shopName: string;
}
