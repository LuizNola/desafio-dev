import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { DataImport } from '../data-import/entities/data-import.entity';
import { DataImportService } from '../data-import/data-import.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, DataImport])],
  controllers: [TransactionsController],
  providers: [TransactionsService, DataImportService],
})
export class TransactionsModule {}
