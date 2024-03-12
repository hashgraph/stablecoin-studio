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
  Post,
  Put,
  Query,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {CreateTransactionResponseDto} from './dto/create-transaction-response.dto';
import {CreateTransactionRequestDto} from './dto/create-transaction-request.dto';
import TransactionService from './transaction.service';
import Transaction from './transaction.entity';
import {SignTransactionRequestDto} from './dto/sign-transaction-request.dto';
import {GetTransactionsResponseDto} from './dto/get-transactions-response.dto';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {OriginGuard} from '../guards/origin.guard';
import {Pagination} from 'nestjs-typeorm-paginate';
import {LoggerService} from '../logger/logger.service';
import LogMessageDTO from '../logger/dto/log-message.dto';
import {Request} from 'express';
import {REQUEST_ID_HTTP_HEADER} from '../common/constants';
import {HttpExceptionFilter} from '../common/exceptions/http-exception.filter';
import {ParsePagePipe} from '../common/pipes/parse-page.pipe';

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
  @UseFilters(HttpExceptionFilter)
  async getByPublicKey(
    @Req() request: Request,
    @Param('publicKey') publicKey: string,
    @Query('type') type?: string,
    @Query('page', new DefaultValuePipe(1), ParsePagePipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParsePagePipe) limit?: number,
  ): Promise<Pagination<GetTransactionsResponseDto>> {
    this.loggerService.log(
      new LogMessageDTO(request[REQUEST_ID_HTTP_HEADER], 'Get transactions', {
        key: publicKey,
        type: type,
        page: page,
        limit: limit,
      }),
    );
    limit = limit > 100 ? 100 : limit;
    type = type ? type.toLowerCase() : type;

    this.loggerService.debug(
      new LogMessageDTO(
        request[REQUEST_ID_HTTP_HEADER],
        'Get transactions limit set',
        limit,
      ),
    );
    this.loggerService.debug(
      new LogMessageDTO(
        request[REQUEST_ID_HTTP_HEADER],
        'Get transactions type set',
        type,
      ),
    );
    try {
      return await this.transactionService.getAllByPublicKey(publicKey, type, {
        page,
        limit,
      });
    } catch (error) {
      this.loggerService.error(
        new LogMessageDTO(
          request[REQUEST_ID_HTTP_HEADER],
          'Error getting transactions',
          error.message,
        ),
      );
      throw error;
    }
  }

  @ApiOkResponse({
    description: 'The transactions have been successfully retrieved.',
    type: [GetTransactionsResponseDto],
  })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ForbiddenException })
  @Get()
  @UseFilters(HttpExceptionFilter)
  async getAll(
    @Req() request: Request,
    @Query('page', new DefaultValuePipe(1), ParsePagePipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParsePagePipe) limit?: number,
  ): Promise<Pagination<GetTransactionsResponseDto>> {
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
      return await this.transactionService.getAll({
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
