import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { DataImportService } from './data-import.service';
import { CreateDataImportDto } from './dto/create-data-import.dto';
import { UpdateDataImportDto } from './dto/update-data-import.dto';

@Controller('data-import')
export class DataImportController {
  constructor(private readonly dataImportService: DataImportService) {}

  @Post()
  create(@Body() createDataImportDto: CreateDataImportDto) {
    return this.dataImportService.create(createDataImportDto);
  }

  @Get()
  async findAll(
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
  ) {
    return this.dataImportService.findAll({ take, skip });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDataImportDto: UpdateDataImportDto,
  ) {
    return this.dataImportService.update(id, updateDataImportDto);
  }
}
