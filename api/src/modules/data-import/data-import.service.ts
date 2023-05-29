import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDataImportDto } from './dto/create-data-import.dto';
import { UpdateDataImportDto } from './dto/update-data-import.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataImport } from './entities/data-import.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DataImportService {
  constructor(
    @InjectRepository(DataImport)
    private readonly dataImportRepository: Repository<DataImport>,
  ) {}

  async create(createDataImportDto: CreateDataImportDto) {
    const createdData = this.dataImportRepository.create(createDataImportDto);
    return await this.dataImportRepository.save(createdData);
  }

  async findAll({ take, skip }: { take: number; skip: number }) {
    const [result, total] = await this.dataImportRepository.findAndCount({
      take,
      skip,
      order: { createdAt: 'DESC' },
    });

    return {
      data: result,
      count: total,
    };
  }

  async update(id: string, updateDataImportDto: UpdateDataImportDto) {
    const dataImport = await this.dataImportRepository.findOne({
      where: { id },
    });

    if (!dataImport) {
      throw new NotFoundException(`Data import with ID ${id} not found`);
    }

    const updatedDataImport = this.dataImportRepository.merge(
      dataImport,
      updateDataImportDto,
    );

    return this.dataImportRepository.save(updatedDataImport);
  }
}
