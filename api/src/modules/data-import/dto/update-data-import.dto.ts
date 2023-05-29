import { PartialType } from '@nestjs/mapped-types';
import { CreateDataImportDto } from './create-data-import.dto';

export class UpdateDataImportDto extends PartialType(CreateDataImportDto) {}
