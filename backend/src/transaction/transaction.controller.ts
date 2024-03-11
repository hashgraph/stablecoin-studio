import {
  Req,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateTransactionResponseDto } from './dto/create-transaction-response.dto';
import { CreateTransactionRequestDto } from './dto/create-transaction-request.dto';
import TransactionService from './transaction.service';
import Transaction from './transaction.entity';
import { SignTransactionRequestDto } from './dto/sign-transaction-request.dto';
import { GetTransactionsResponseDto } from './dto/get-transactions-response.dto';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OriginGuard } from '../guards/origin.guard';
import { Pagination } from 'nestjs-typeorm-paginate';
import { LoggerService } from '../logger/logger.service';
import { Request } from 'express';

@ApiTags('Transactions')
@Controller('/api/transactions')
export default class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly loggerService: LoggerService,
  ) {}

  @Post()
  @UseGuards(OriginGuard)
  @HttpCode(HttpStatus.CREATED) // 201 Created
  @ApiCreatedResponse({
    description: 'The transaction has been successfully created.',
    type: CreateTransactionResponseDto,
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async addTransaction(
    @Req() request: Request,
    @Body() createTransactionDto: CreateTransactionRequestDto,
  ): Promise<CreateTransactionResponseDto> {
    this.loggerService.log(
      `Add transaction body ${JSON.stringify(createTransactionDto)}`,
      request['requestId'],
    );
    const transaction: Transaction =
      await this.transactionService.create(createTransactionDto);
    return new CreateTransactionResponseDto(transaction.id);
  }

  @Put(':transactionId')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content (successful update, no response body needed
  @ApiNoContentResponse({
    description: 'The transaction has been successfully updated.',
  })
  @ApiParam({
    name: 'transactionId',
    description: 'The transaction ID to update',
    required: true,
  })
  async signTransaction(
    @Req() request: Request,
    @Param('transactionId') transactionId: string,
    @Body() signTransactionDto: SignTransactionRequestDto,
  ): Promise<void> {
    this.loggerService.log(
      `Sign transaction id ${transactionId}, body ${JSON.stringify(signTransactionDto)}`,
      request['requestId'],
    );
    await this.transactionService.sign(signTransactionDto, transactionId);
  }

  @Delete(':transactionId')
  @UseGuards(OriginGuard)
  @HttpCode(HttpStatus.OK) // 200 OK
  @ApiOkResponse({
    description: 'The transaction has been successfully deleted.',
  })
  @ApiParam({
    name: 'transactionId',
    description: 'The transaction ID to delete',
    required: true,
  })
  async deleteTransaction(
    @Req() request: Request,
    @Param('transactionId') transactionId: string,
  ): Promise<void> {
    this.loggerService.log(
      `Delete transaction id ${transactionId}`,
      request['requestId'],
    );
    await this.transactionService.delete(transactionId);
  }

  @Get(':publicKey')
  @HttpCode(HttpStatus.OK) // 200 OK
  @ApiOkResponse({
    description: 'The transactions have been successfully retrieved.',
    type: [GetTransactionsResponseDto],
  })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenException })
  @ApiParam({
    name: 'publicKey',
    description: 'The public key to retrieve transactions for',
    required: true,
  })
  async getByPublicKey(
    @Req() request: Request,
    @Param('publicKey') publicKey: string,
    @Query('type') type?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ): Promise<Pagination<GetTransactionsResponseDto>> {
    this.loggerService.log(
      `Get transactions for public key ${publicKey}, type ${type}, page ${page ? page : '0'}, limit ${limit ? limit : '0'}`,
      request['requestId'],
    );
    limit = limit > 100 ? 100 : limit;
    type = type ? type.toLowerCase() : type;
    this.loggerService.log(
      `type ${type}, limit ${limit}`,
      request['requestId'],
    );
    return await this.transactionService.getAllByPublicKey(publicKey, type, {
      page,
      limit,
    });
  }

  @ApiOkResponse({
    description: 'The transactions have been successfully retrieved.',
    type: [GetTransactionsResponseDto],
  })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenException })
  @Get()
  async getAll(
    @Req() request: Request,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ): Promise<Pagination<GetTransactionsResponseDto>> {
    limit = limit > 100 ? 100 : limit;
    return await this.transactionService.getAll({
      page,
      limit,
    });
  }
}
