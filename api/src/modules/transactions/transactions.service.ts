import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { DataSource, EntityManager, FindOneOptions, Repository } from 'typeorm';
import { Request, Response } from 'express';
import { Readable, Stream } from 'stream';
import * as Excel from 'exceljs';
import { IImportTransactionResults } from './type/import-transactions.type';
import { DataImport } from '../data-import/entities/data-import.entity';
import { TransactionType } from './type/transactions-type.enum';
import { DataImportService } from '../data-import/data-import.service';
import { StatusType } from '../data-import/types/import-status.enum';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.TYPEORM_HOST || 'localhost',
  port: 5432,
  username: process.env.TYPEORM_USERNAME || 'postgress',
  password: process.env.TYPEORM_PASSWORD || 'postgress',
  database: process.env.TYPEORM_DATABASE || 'bycoders',
});

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private dataImportService: DataImportService,
  ) {}

  async create(createTransaction: CreateTransactionDto) {
    const createdTransaction =
      this.transactionRepository.create(createTransaction);

    return await this.transactionRepository.save(createdTransaction);
  }

  async findAll({ take, skip }: { take: number; skip: number }) {
    const [result, total] = await this.transactionRepository.findAndCount({
      take,
      skip,
      order: { createdAt: 'DESC' },
    });

    return {
      data: result,
      count: total,
    };
  }

  async findOne(options: FindOneOptions<Transaction>) {
    try {
      return await this.transactionRepository.findOneOrFail(options);
    } catch (error) {
      throw new NotFoundException('Transação nao encontrada!!');
    }
  }
  async exportImportTransactionsTemplate(
    stream: Stream,
    fileName: string,
  ): Promise<void> {
    const workbookWriter = new Excel.stream.xlsx.WorkbookWriter({
      filename: fileName,
      stream,
      useStyles: true,
    });
    const worksheet = workbookWriter.addWorksheet('Template');
    const firstRow = worksheet.getRow(1);
    const headers = Object.keys(this.importTransactionsTemplateColumns);
    worksheet.columns = headers.map((header) => ({ key: header, width: 20 }));
    firstRow.values = headers;
    firstRow.fill = this.excelStyle.headerFill;
    firstRow.font = this.excelStyle.headerFont;
    firstRow.alignment = this.excelStyle.headerAlignment;
    firstRow.height = this.excelStyle.headerHeight;
    firstRow.border = this.excelStyle.border;

    worksheet.columns.forEach((col) => {
      if (col !== undefined) {
        col.numFmt = '@';
      }
    });

    worksheet.commit();
    await workbookWriter.commit();
  }

  private isValidTransactionType(value: string): boolean {
    return Object.values(TransactionType).includes(value as TransactionType);
  }

  async saveFile(
    file: Express.Multer.File,
  ): Promise<{ sucess: boolean; message: string }> {
    if (!file) {
      return {
        sucess: false,
        message: 'Arquivo não encontrado',
      };
    }

    if (file.originalname.split('.').pop() !== 'xlsx') {
      return {
        sucess: false,
        message: 'Formato de arquivo invalido, tente em XLSX',
      };
    }
    const createdDataImport = await this.dataImportService.create({
      status: StatusType.LOAD,
    });
    console.log(createdDataImport);

    const buffer = file.buffer;

    const stream = new Readable({
      read() {
        this.push(buffer);
        this.push(null);
      },
    });

    const workbookReader = new Excel.stream.xlsx.WorkbookReader(stream, {});

    const results: IImportTransactionResults = {
      errorList: [],
      transactionsToCreate: [],
    };

    for await (const worksheetReader of workbookReader) {
      for await (const row of worksheetReader) {
        if (row.number === 1) {
          if (!this.validFileHeader(row, results)) {
            break;
          }
        } else {
          if (row.getCell(1).value) {
            await this.validRow(row, results);
          } else {
            break;
          }
        }
      }
    }

    if (results.errorList.length > 0) {
      await this.dataImportService.update(createdDataImport.id, {
        status: StatusType.ERROR,
        message: results.errorList
          .map((error) => `Erro: ${error.message} Na linha ${error.row} `)
          .join(),
      });
    } else {
      try {
        await this.createManyTransactions(results.transactionsToCreate);
        await this.dataImportService.update(createdDataImport.id, {
          status: StatusType.SUCESS,
        });
        return {
          sucess: true,
          message: 'Cadastradas com sucesso',
        };
      } catch (err) {
        return {
          sucess: false,
          message: 'erro ao cadastrar as transações: ' + err,
        };
      }
    }

    return { sucess: false, message: 'Erro ao importar transações' };
  }

  private async createManyTransactions(transactions: CreateTransactionDto[]) {
    const createdTransactions = this.transactionRepository.create(transactions);

    return await this.transactionRepository.save(createdTransactions);
  }

  private validFileHeader(
    headerRow: Excel.Row,
    results: IImportTransactionResults,
  ): boolean {
    const receivedColumns: string[] = [];
    headerRow.eachCell((cell) => receivedColumns.push(cell.text));
    if (!receivedColumns) {
      results.errorList.push({
        message: 'Estrutura da tabela inválida!',
        row: headerRow.number,
      });
      return false;
    }

    const extraColumns = receivedColumns.filter(
      (col) => !this.importTransactionsTemplateColumns[col],
    );

    if (extraColumns.length) {
      results.errorList.push({
        message: `Há colunas extras na tabela (${extraColumns.toString()})`,
        row: headerRow.number,
      });
      return false;
    }

    const invalidColumns = Object.values(this.importTransactionsTemplateColumns)
      .map((col) => {
        const headerIx = receivedColumns.findIndex(
          (x) => x?.toString().toLowerCase() === col.label.toLocaleLowerCase(),
        );

        if (headerIx < 0 && col.required) {
          return col.label;
        }

        return false;
      })
      .filter((x) => x !== false);

    if (invalidColumns.length > 0) {
      const invalidMessage = `Cabeçalhos inválidos:\n ${invalidColumns.join(
        '\n',
      )}`;
      results.errorList.push({
        message: invalidMessage,
        row: headerRow.number,
      });
      throw new Error(invalidMessage);
    }

    return true;
  }

  private getCellText(cell: Excel.Cell): string {
    return cell.text?.toString();
  }

  private async validRow(
    row: Excel.Row,
    results: IImportTransactionResults,
  ): Promise<void> {
    let hasError = false;
    const [day, month, year] = this.getCellText(row.getCell(4)).split('/');

    const timeOfOccurrence = new Date(`${month}/${day}/${year}`);

    if (isNaN(timeOfOccurrence.getTime())) {
      hasError = true;
      results.errorList.push({
        row: row.number,
        message: 'Data Invalida, lembrese do formato: dd/mm/aaaa',
      });
    }

    if (!this.isValidTransactionType(this.getCellText(row.getCell(1)))) {
      hasError = true;
      results.errorList.push({
        row: row.number,
        message:
          'Tipo de transação invalido, os tipos aceitos são: debit, ticket, financing, credit, loan_receipt, sales, ted, doc, rent"',
      });
    }
    if (!hasError) {
      const transaction: CreateTransactionDto = {
        type: this.getCellText(row.getCell(1)) as TransactionType,
        value: +this.getCellText(row.getCell(2)),
        cpf: this.getCellText(row.getCell(3)),
        timeOfOccurrence,
        card: this.getCellText(row.getCell(5)),
        shopOwner: this.getCellText(row.getCell(6)),
        shopName: this.getCellText(row.getCell(7)),
      };

      const transactionObjcteSize = Object.keys(transaction).length;

      for (let i = 1; i <= transactionObjcteSize; i++) {
        if (!row.getCell(i).value) {
          hasError = true;
          results.errorList.push({
            message: `Dados inválidos!`,
            row: row.number,
          });
        }
      }

      if (!hasError) {
        results.transactionsToCreate.push(transaction);
      }
    }
  }

  async remove(id: string) {
    await this.findOne({ where: { id } });

    return await this.transactionRepository.softDelete({ id });
  }

  private readonly excelStyle: {
    headerAlignment: Partial<Excel.Alignment>;
    headerFont: Partial<Excel.Font>;
    headerFill: Excel.Fill;
    border: Partial<Excel.Borders>;
    headerHeight: number;
    greyRowFill: Excel.Fill;
    greenRowFill: Excel.Fill;
  } = {
    headerAlignment: {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    },
    headerFont: {
      name: 'Calibri',
      size: 11,
      color: { argb: 'FFFFFF' },
    },
    headerFill: {
      type: 'pattern',
      pattern: 'solid',
      bgColor: { argb: 'A661F6' },
      fgColor: { argb: 'A661F6' },
    },
    border: {
      left: { style: 'thin', color: { argb: 'D8D5D6' } },
      right: { style: 'thin', color: { argb: 'D8D5D6' } },
    },
    headerHeight: 40,
    greyRowFill: {
      type: 'pattern',
      pattern: 'solid',
      bgColor: { argb: 'F1F2F2' },
      fgColor: { argb: 'F1F2F2' },
    },
    greenRowFill: {
      type: 'pattern',
      pattern: 'solid',
      bgColor: { argb: 'd5f8b9' },
      fgColor: { argb: 'd5f8b9' },
    },
  };

  private readonly importTransactionsTemplateColumns: {
    [key: string]: {
      label: string;
      index: number;
      required: boolean;
    };
  } = {
    'Tipo da transação': {
      label: 'Tipo da transação',
      index: 1,
      required: true,
    },
    'Valor da transação': {
      label: 'Valor da transação',
      index: 2,
      required: true,
    },
    cpf: {
      label: 'cpf',
      index: 3,
      required: true,
    },
    'Data da ocorrência': {
      label: 'Data da ocorrência',
      index: 4,
      required: true,
    },
    'Número do cartão': {
      label: 'Número do cartão',
      index: 5,
      required: true,
    },
    'Proprietário da loja': {
      label: 'Proprietário da loja',
      index: 6,
      required: true,
    },
    'Nome da loja': {
      label: 'Nome da loja',
      index: 7,
      required: true,
    },
  };
}
