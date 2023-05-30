import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Req,
  UseInterceptors,
  Res,
  UploadedFile,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    return await this.transactionsService.create(createTransactionDto);
  }

  @Post('/import')
  @UseInterceptors(FileInterceptor('file'))
  async ReceiveTransactionFile(@UploadedFile() file: Express.Multer.File) {
    return await this.transactionsService.saveFile(file);
  }

  @Get('/template')
  async exportTemplate(@Res() res: Response) {
    const fileName = 'template_tranaacoes.xlsx';
    res.writeHead(200, {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-disposition': 'attachment;filename=' + fileName,
    });
    await this.transactionsService.exportImportTransactionsTemplate(
      res,
      fileName,
    );
    return res.end();
  }

  @Get()
  async findAll(
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
  ) {
    return this.transactionsService.findAll({ take, skip });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.transactionsService.findOne({ where: { id } });
  }

  @Get('byname/:name')
  async findOneByName(@Param('name') name: string) {
    return this.transactionsService.findAllByName(name);
  }
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.transactionsService.remove(id);
  }
}
