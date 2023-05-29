import { Module } from '@nestjs/common';
import { DataImportService } from './data-import.service';
import { DataImportController } from './data-import.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataImport } from './entities/data-import.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DataImport])],
  controllers: [DataImportController],
  providers: [DataImportService],
})
export class DataImportModule {}
