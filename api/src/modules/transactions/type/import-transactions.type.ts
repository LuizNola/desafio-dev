import { CreateTransactionDto } from '../dto/create-transaction.dto';

interface error {
  row: number;
  message: string;
}

export interface IImportTransactionResults {
  errorList: error[];
  transactionsToCreate: CreateTransactionDto[];
}
