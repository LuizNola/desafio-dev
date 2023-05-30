import { Test } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { NotFoundException } from '@nestjs/common';
import { DataImportService } from '../data-import/data-import.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionType } from './type/transactions-type.enum';

describe('TransactionsService', () => {
  let transactionsService: TransactionsService;
  let transactionRepositoryMock: any;
  let dataImportServiceMock: any;

  beforeEach(async () => {
    transactionRepositoryMock = {
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
      find: jest.fn(),
      findOneOrFail: jest.fn(),
      softDelete: jest.fn(),
    };

    dataImportServiceMock = {
      create: jest.fn(),
      update: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: transactionRepositoryMock,
        },
        {
          provide: DataImportService,
          useValue: dataImportServiceMock,
        },
      ],
    }).compile();

    transactionsService =
      moduleRef.get<TransactionsService>(TransactionsService);
  });

  describe('create', () => {
    it('should create a transaction', async () => {
      const createTransactionDto: CreateTransactionDto = {
        card: '111111',
        cpf: '44444',
        shopName: '44444',
        shopOwner: '444',
        timeOfOccurrence: new Date(),
        type: TransactionType.DEBIT,
        value: 15454,
      };

      const createdTransaction = { id: 'uuid', ...createTransactionDto };

      transactionRepositoryMock.create.mockReturnValue(createdTransaction);
      transactionRepositoryMock.save.mockResolvedValue(createdTransaction);

      const result = await transactionsService.create(createTransactionDto);

      expect(transactionRepositoryMock.create).toHaveBeenCalledWith(
        createTransactionDto,
      );
      expect(transactionRepositoryMock.save).toHaveBeenCalledWith(
        createdTransaction,
      );
      expect(result).toEqual(createdTransaction);
    });
  });

  describe('findAll', () => {
    it('should return a list of transactions', async () => {
      const take = 10;
      const skip = 0;
      const transactions = [{ id: '1' }, { id: '2' }];
      const total = transactions.length;

      transactionRepositoryMock.findAndCount.mockResolvedValue([
        transactions,
        total,
      ]);

      const result = await transactionsService.findAll({ take, skip });

      expect(transactionRepositoryMock.findAndCount).toHaveBeenCalledWith({
        take,
        skip,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({ data: transactions, count: total });
    });
  });

  describe('findAllByName', () => {
    it('should return transactions for a given shop name', async () => {
      const shopName = 'shop1';
      const transactions = [{ id: '1' }, { id: '2' }];

      transactionRepositoryMock.find.mockResolvedValue(transactions);

      const result = await transactionsService.findAllByName(shopName);

      expect(transactionRepositoryMock.find).toHaveBeenCalledWith({
        where: { shopName },
      });
      expect(result).toEqual(transactions);
    });

    it('should throw NotFoundException if no transactions found for the given shop name', async () => {
      const shopName = 'shop1';

      transactionRepositoryMock.find.mockResolvedValue([]);

      await expect(
        transactionsService.findAllByName(shopName),
      ).rejects.toThrowError(NotFoundException);
      expect(transactionRepositoryMock.find).toHaveBeenCalledWith({
        where: { shopName },
      });
    });
  });

  describe('findOne', () => {
    it('should return a transaction by id', async () => {
      const id = 'uuid';
      const transaction = { id };

      transactionRepositoryMock.findOneOrFail.mockResolvedValue(transaction);

      const result = await transactionsService.findOne({ where: { id } });

      expect(transactionRepositoryMock.findOneOrFail).toHaveBeenCalledWith(id);
      expect(result.id).toEqual(transaction.id);
    });

    it('should throw NotFoundException if no transaction found for the given id', async () => {
      const id = 'uuid';

      transactionRepositoryMock.findOneOrFail.mockRejectedValue(undefined);

      await expect(
        transactionsService.findOne({ where: { id } }),
      ).rejects.toThrowError(NotFoundException);
      expect(transactionRepositoryMock.findOneOrFail).toHaveBeenCalledWith(id);
    });
  });

  describe('delete', () => {
    it('should delete a transaction by id', async () => {
      const id = 'uuid';

      transactionRepositoryMock.softDelete.mockResolvedValue({ affected: 1 });

      await transactionsService.remove(id);

      expect(transactionRepositoryMock.softDelete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if no transaction found for the given id', async () => {
      const id = 'uuid';

      transactionRepositoryMock.softDelete.mockResolvedValue({ affected: 0 });

      await expect(transactionsService.remove(id)).rejects.toThrowError(
        NotFoundException,
      );
      expect(transactionRepositoryMock.softDelete).toHaveBeenCalledWith(id);
    });
  });
});
