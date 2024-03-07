import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateTransactionResponseDto } from './dto/create-transaction-response.dto';
import { CreateTransactionRequestDto } from './dto/create-transaction-request.dto';
import TransactionService from './transaction.service';
import { Transaction } from './transaction.entity';
import { SignTransactionRequestDto } from './dto/sign-transaction-request.dto';
import { getTransactionsResponseDto } from './dto/get-transactions-response.dto';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OriginGuard } from '../guards/origin.guard';

@ApiTags('Transactions')
@Controller('/api/transactions')
export default class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @UseGuards(OriginGuard)
  @HttpCode(HttpStatus.CREATED) // 201 Created
  @ApiCreatedResponse({
    description: 'The transaction has been successfully created.',
    type: CreateTransactionResponseDto,
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async addTransaction(
    @Body() createTransactionDto: CreateTransactionRequestDto,
  ): Promise<CreateTransactionResponseDto> {
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
    @Param('transactionId') transactionId: string,
    @Body() signTransactionDto: SignTransactionRequestDto,
  ): Promise<void> {
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
    @Param('transactionId') transactionId: string,
  ): Promise<void> {
    await this.transactionService.delete(transactionId);
  }

  @Get(':publicKey')
  @UseGuards(OriginGuard)
  @HttpCode(HttpStatus.OK) // 200 OK
  @ApiOkResponse({
    description: 'The transactions have been successfully retrieved.',
    type: [getTransactionsResponseDto],
  })
  @ApiParam({
    name: 'publicKey',
    description: 'The public key to retrieve transactions for',
    required: true,
  })
  async getTransactions(
    @Param('publicKey') publicKey: string,
  ): Promise<getTransactionsResponseDto[]> {
    return await this.transactionService.getAll(publicKey);
  }
}
