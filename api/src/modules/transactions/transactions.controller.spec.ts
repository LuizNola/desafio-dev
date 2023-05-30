import { Test } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionType } from './type/transactions-type.enum';
import { Transaction } from './entities/transaction.entity';
import { Response } from 'express';

describe('TransactionsController', () => {
  let transactionsController: TransactionsController;
  let transactionsService: TransactionsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [TransactionsService],
    }).compile();

    transactionsService =
      moduleRef.get<TransactionsService>(TransactionsService);
    transactionsController = moduleRef.get<TransactionsController>(
      TransactionsController,
    );
  });

  describe('create', () => {
    it('should create a new transaction', async () => {
      const createTransactionDto: CreateTransactionDto = {
        card: '111111',
        cpf: '44444',
        shopName: '44444',
        shopOwner: '444',
        timeOfOccurrence: new Date(),
        type: TransactionType.DEBIT,
        value: 15454,
      };
      const createdTransaction: Transaction = {
        id: 'uuid',
        createdAt: new Date(),
        deletedAt: null,
        updatedAt: new Date(),
        card: '111111',
        cpf: '44444',
        shopName: '44444',
        shopOwner: '444',
        timeOfOccurrence: new Date(),
        type: TransactionType.DEBIT,
        value: 15454,
      };

      jest
        .spyOn(transactionsService, 'create')
        .mockResolvedValue(createdTransaction);

      const result = await transactionsController.create(createTransactionDto);

      expect(transactionsService.create).toHaveBeenCalledWith(
        createTransactionDto,
      );
      expect(result.shopName).toBe(createdTransaction.shopName);
    });
  });

  describe('exportTemplate', () => {
    it('should export the template file', async () => {
      const res: Partial<Response> = {
        writeHead: jest.fn(),
        end: jest.fn(),
      };

      const fileName = 'template_tranaacoes.xlsx';

      jest
        .spyOn(transactionsService, 'exportImportTransactionsTemplate')
        .mockResolvedValue();

      await transactionsController.exportTemplate(res as Response);

      expect(res.writeHead).toHaveBeenCalledWith(200, {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-disposition': 'attachment;filename=' + fileName,
      });
      expect(
        transactionsService.exportImportTransactionsTemplate,
      ).toHaveBeenCalledWith(res, fileName);
      expect(res.end).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should find all transactions with default parameters', async () => {
      const take = 10;
      const skip = 0;
      const transactions = [
        {
          id: 'uuid',
          createdAt: new Date(),
          deletedAt: null,
          updatedAt: new Date(),
          card: '111111',
          cpf: '44444',
          shopName: '44444',
          shopOwner: '444',
          timeOfOccurrence: new Date(),
          type: TransactionType.DEBIT,
          value: 15454,
        },
      ]; // Replace with the expected transactions array

      jest
        .spyOn(transactionsService, 'findAll')
        .mockResolvedValue({ data: transactions, count: transactions.length });

      const result = await transactionsController.findAll(take, skip);

      expect(transactionsService.findAll).toHaveBeenCalledWith({ take, skip });
      expect(result.count).toBe(transactions.length);
    });
  });

  describe('findOne', () => {
    it('should find a transaction by ID', async () => {
      const id = '123';
      const transaction = {
        id: 'uuid',
        createdAt: new Date(),
        deletedAt: null,
        updatedAt: new Date(),
        card: '111111',
        cpf: '44444',
        shopName: '44444',
        shopOwner: '444',
        timeOfOccurrence: new Date(),
        type: TransactionType.DEBIT,
        value: 15454,
      }; // Replace with the expected transaction

      jest.spyOn(transactionsService, 'findOne').mockResolvedValue(transaction);

      const result = await transactionsController.findOne(id);

      expect(transactionsService.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toBe(transaction);
    });
  });

  describe('remove', () => {
    it('should remove a transaction by ID', async () => {
      const id = '123';

      jest.spyOn(transactionsService, 'remove').mockResolvedValue(undefined);

      const result = await transactionsController.remove(id);

      expect(transactionsService.remove).toHaveBeenCalledWith(id);
      expect(result).toBeUndefined();
    });
  });
});
