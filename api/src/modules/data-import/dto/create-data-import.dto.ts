import { IsEnum, IsNotEmpty } from 'class-validator';
import { StatusType } from '../types/import-status.enum';

export class CreateDataImportDto {
  @IsEnum(StatusType, {
    message: 'O campo status deve ser um valor válido.',
  })
  @IsNotEmpty({ message: 'O campo status é obrigatório.' })
  status: StatusType;

  message?: string;
}
