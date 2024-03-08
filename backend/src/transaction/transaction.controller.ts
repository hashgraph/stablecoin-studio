import {
  BadRequestException,
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
import { IsNotEmpty } from 'class-validator';

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
    @Param('publicKey') publicKey: string,
    @Query('type') type?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ): Promise<Pagination<GetTransactionsResponseDto>> {
    limit = limit > 100 ? 100 : limit;
    type = type ? type.toLowerCase() : type;
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
