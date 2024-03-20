/*
 *
 * Hedera Stablecoin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import {
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
  Req,
  UseFilters,
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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OriginGuard } from '../guards/origin.guard';
import { Pagination } from 'nestjs-typeorm-paginate';
import { LoggerService } from '../logger/logger.service';
import LogMessageDTO from '../logger/dto/log-message.dto';
import { Request } from 'express';
import { REQUEST_ID_HTTP_HEADER } from '../common/constants';
import { HttpExceptionFilter } from '../common/exceptions/http-exception.filter';

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
  @UseFilters(HttpExceptionFilter)
  async addTransaction(
    @Req() request: Request,
    @Body() createTransactionDto: CreateTransactionRequestDto,
  ): Promise<CreateTransactionResponseDto> {
    this.loggerService.log(
      new LogMessageDTO(
        request[REQUEST_ID_HTTP_HEADER],
        'Add transaction body ',
        createTransactionDto,
      ),
    );
    try {
      const transaction: Transaction =
        await this.transactionService.create(createTransactionDto);
      return new CreateTransactionResponseDto(transaction.id);
    } catch (error) {
      this.loggerService.error(
        new LogMessageDTO(
          request[REQUEST_ID_HTTP_HEADER],
          'Error adding transaction',
          error.message,
        ),
      );
      throw error;
    }
  }

  @Put(':transactionId')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content (successful update, no response body needed
  @ApiNoContentResponse({
    description: 'The transaction has been successfully updated.',
  })
  @ApiParam({
    name: 'transactionId',
    description: 'The transaction ID to update',
    example: 'e8fe7d5e-2a94-472c-bab8-e693e401134f',
    required: true,
  })
  @UseFilters(HttpExceptionFilter)
  async signTransaction(
    @Req() request: Request,
    @Param('transactionId') transactionId: string,
    @Body() signTransactionDto: SignTransactionRequestDto,
  ): Promise<void> {
    this.loggerService.log(
      new LogMessageDTO(request[REQUEST_ID_HTTP_HEADER], 'Sign transaction', {
        id: transactionId,
        body: signTransactionDto,
      }),
    );
    try {
      await this.transactionService.sign(signTransactionDto, transactionId);
    } catch (error) {
      this.loggerService.error(
        new LogMessageDTO(
          request[REQUEST_ID_HTTP_HEADER],
          'Error signing transaction',
          error.message,
        ),
      );
      throw error;
    }
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
  @UseFilters(HttpExceptionFilter)
  async deleteTransaction(
    @Req() request: Request,
    @Param('transactionId') transactionId: string,
  ): Promise<void> {
    this.loggerService.log(
      new LogMessageDTO(
        request[REQUEST_ID_HTTP_HEADER],
        'Delete transaction',
        transactionId,
      ),
    );
    try {
      await this.transactionService.delete(transactionId);
    } catch (error) {
      this.loggerService.error(
        new LogMessageDTO(
          request[REQUEST_ID_HTTP_HEADER],
          'Error deleting transaction',
          error.message,
        ),
      );
      throw error;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK) // 200 OK
  @ApiOkResponse({
    description: 'The transactions have been successfully retrieved.',
    type: [GetTransactionsResponseDto],
  })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenException })
  @ApiQuery({ name: 'publicKey', description: 'The public key to retrieve transactions for', required: false })
  @ApiQuery({ name: 'status', description: 'The status of transaction to retrieve', required: false })
  @ApiQuery({ name: 'page', description: 'The page number to retrieve', required: false })
  @ApiQuery({ name: 'limit', description: 'The number of transactions to retrieve per page', required: false })
  @ApiQuery({ name: 'network', description: 'The network from which to retrieve transactions', required: false })
  @UseFilters(HttpExceptionFilter)
  async getTransactions(
    @Req() request: Request,
    @Query('publicKey') publicKey?: string,
    @Query('status') status?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('network') network?: string,
  ): Promise<Pagination<GetTransactionsResponseDto>> {
    {
      if (page < 1) {
        throw new Error('Page must be greater than 0');
      }
      this.loggerService.log(
        new LogMessageDTO(request[REQUEST_ID_HTTP_HEADER], 'Get All', {
          page: page,
          limit: limit,
        }),
      );
      limit = limit > 100 ? 100 : limit;
      this.loggerService.debug(
        new LogMessageDTO(
          request[REQUEST_ID_HTTP_HEADER],
          'Get All limit set',
          limit,
        ),
      );

      try {
        return await this.transactionService.getAll(publicKey, status, network, {
          page,
          limit,
        });
      } catch (error) {
        this.loggerService.error(
          new LogMessageDTO(
            request[REQUEST_ID_HTTP_HEADER],
            'Error getting all transactions',
            error.message,
          ),
        );
        throw error;
      }
    }
  }

  @Get('/:transactionId')
  @ApiOkResponse({
    description: 'The transaction has been successfully retrieved.',
    type: GetTransactionsResponseDto,
  })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenException })
  @UseFilters(HttpExceptionFilter)
  async getTransactionById(
    @Req() request: Request,
    @Param('transactionId') transactionId: string,
  ): Promise<GetTransactionsResponseDto> {
    this.loggerService.log(
      new LogMessageDTO(
        request[REQUEST_ID_HTTP_HEADER],
        'Get transaction by id',
        transactionId,
      ),
    );
    try {
      return await this.transactionService.getById(transactionId);
    } catch (error) {
      this.loggerService.error(
        new LogMessageDTO(
          request[REQUEST_ID_HTTP_HEADER],
          'Error getting transaction by id',
          error.message,
        ),
      );
      throw error;
    }
  }
}
