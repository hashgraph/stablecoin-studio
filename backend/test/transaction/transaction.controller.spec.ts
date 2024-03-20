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

import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pagination, IPaginationMeta } from 'nestjs-typeorm-paginate';
import { CreateTransactionRequestDto } from '../../src/transaction/dto/create-transaction-request.dto';
import TransactionController from '../../src/transaction/transaction.controller';
import Transaction from '../../src/transaction/transaction.entity';
import TransactionService from '../../src/transaction/transaction.service';
import { CreateTransactionResponseDto } from '../../src/transaction/dto/create-transaction-response.dto';
import { SignTransactionRequestDto } from '../../src/transaction/dto/sign-transaction-request.dto';
import { GetTransactionsResponseDto } from '../../src/transaction/dto/get-transactions-response.dto';
import { LoggerService } from '../../src/logger/logger.service';
import TransactionMock, { DEFAULT } from './transaction.mock';
import { Request } from 'express';
import { OriginGuard } from '../../src/guards/origin.guard';

const HTTP_REQUEST = {
  headers: {
    'x-request-id': '1234',
  },
  get: jest.fn(),
  header: jest.fn(),
  accepts: jest.fn(),
  acceptsCharsets: jest.fn(),
  // Add the rest of the missing methods here
} as unknown as Request;

describe('Transaction Controller Test', () => {
  let controller: TransactionController;
  let service: TransactionService;

  beforeEach(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        TransactionService,
        ConfigService,
        {
          provide: getRepositoryToken(Transaction),
          useClass: Repository,
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            debug: jest.fn(),
            error: jest.fn(),
          },
        },
        {
          provide: OriginGuard,
          useClass: OriginGuard,
        },
      ],
    }).compile();

    controller = testingModule.get<TransactionController>(
      TransactionController,
    );
    service = testingModule.get<TransactionService>(TransactionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('Create transaction', () => {
    it('should add a new transaction', async () => {
      //* 🗂️ Arrange ⬇
      // Mock input
      const httpRequest = HTTP_REQUEST;
      const pendingTransaction = TransactionMock.txPending0();
      const createTransactionRequestDto = {
        description: pendingTransaction.description,
        hedera_account_id: pendingTransaction.hedera_account_id,
        key_list: pendingTransaction.key_list,
        threshold: pendingTransaction.threshold,
        transaction_message: pendingTransaction.transaction_message,
      } as CreateTransactionRequestDto;
      const createTxRequestCommand = {
        request: httpRequest,
        createTransactionDto: createTransactionRequestDto,
      };
      // Mock service
      jest
        .spyOn(service, 'create')
        .mockImplementation((createTxDto: CreateTransactionRequestDto) =>
          Promise.resolve(
            TransactionMock.txPending0({
              description: createTxDto.description,
              hedera_account_id: createTxDto.hedera_account_id,
              key_list: createTxDto.key_list,
              threshold: createTxDto.threshold,
              transaction_message: createTxDto.transaction_message,
            }),
          ),
        );
      // Mock expected result
      const expected = {
        transactionId: new TransactionMock().id,
      } as CreateTransactionResponseDto;
      //* 🎬 Act ⬇
      const result = await controller.addTransaction(
        createTxRequestCommand.request,
        createTxRequestCommand.createTransactionDto,
      );
      //* ☑️ Assert ⬇
      expect(result.transactionId).toBe(expected.transactionId);
    });
    it('should create a new transaction with threshold = 0', async () => {
      //* 🗂️ Arrange ⬇
      const THRESHOLD = 0;
      // Mock input
      const httpRequest = HTTP_REQUEST;
      const pendingTransaction = TransactionMock.txPending0({
        threshold: THRESHOLD,
      });
      const createTransactionRequestDto = {
        description: pendingTransaction.description,
        hedera_account_id: pendingTransaction.hedera_account_id,
        key_list: pendingTransaction.key_list,
        threshold: pendingTransaction.threshold,
        transaction_message: pendingTransaction.transaction_message,
      } as CreateTransactionRequestDto;
      const createTxRequestCommand = {
        request: httpRequest,
        createTransactionDto: createTransactionRequestDto,
      };
      // Mock service
      jest
        .spyOn(service, 'create')
        .mockImplementation((createTxDto: CreateTransactionRequestDto) =>
          Promise.resolve(
            TransactionMock.txPending0({
              threshold: createTxDto.key_list.length,
            }),
          ),
        );
      // Mock expected result
      const expected = {
        transactionId: new TransactionMock().id,
      } as CreateTransactionResponseDto;
      //* 🎬 Act ⬇
      const result = await controller.addTransaction(
        createTxRequestCommand.request,
        createTxRequestCommand.createTransactionDto,
      );
      //* ☑️ Assert ⬇
      expect(result.transactionId).toBe(expected.transactionId);
    });
  });

  describe('Sign Transaction', () => {
    it('should sign a transaction', async () => {
      //* 🗂️ Arrange ⬇
      // Input
      const httpRequest = HTTP_REQUEST;
      const transactionId = DEFAULT.id;
      const signTransactionRequestDto = {
        signature: DEFAULT.signatures[0],
        public_key: DEFAULT.key_list[0],
      } as SignTransactionRequestDto;
      const signTransactionCommand = {
        request: httpRequest,
        transactionId,
        signTransactionDto: signTransactionRequestDto,
      };
      // Mock service
      jest
        .spyOn(service, 'sign')
        .mockImplementation(
          (signTxDto: SignTransactionRequestDto, transactionId: string) =>
            Promise.resolve(
              new TransactionMock({
                id: transactionId,
                signed_keys: [signTxDto.public_key],
                signatures: [signTxDto.signature],
              }),
            ),
        );
      // Mock expected result
      // VOID
      //* 🎬 Act ⬇
      const result = await controller.signTransaction(
        signTransactionCommand.request,
        signTransactionCommand.transactionId,
        signTransactionCommand.signTransactionDto,
      );
      //* ☑️ Assert ⬇
      expect(result).toBeUndefined();
    });
  });

  describe('Delete Transaction', () => {
    it('should delete a transaction', async () => {
      //* 🗂️ Arrange ⬇
      // Input
      const httpRequest = HTTP_REQUEST;
      const transactionId = DEFAULT.id;
      const signTransactionCommand = {
        request: httpRequest,
        transactionId,
      };
      // Mock service
      jest
        .spyOn(service, 'delete')
        .mockImplementation((/*transactionId: string*/) =>
          Promise.resolve(undefined),);
      // Mock expected result
      // VOID
      //* 🎬 Act ⬇
      const result = await controller.deleteTransaction(
        signTransactionCommand.request,
        signTransactionCommand.transactionId,
      );
      //* ☑️ Assert ⬇
      expect(result).toBeUndefined();
    });
  });

  describe('Get Transactions', () => {
    it('should get all transactions linked to a public key', async () => {
      //* 🗂️ Arrange ⬇
      // Input
      const request = HTTP_REQUEST;
      const publicKey = DEFAULT.key_list[0];
      const getAllByPublicKeyCommand = {
        request,
        publicKey,
      };
      // Mock service
      jest
        .spyOn(service, 'getAllByPublicKey')
        .mockImplementation((publicKey: string) =>
          Promise.resolve(
            createMockGetAllByPublicKeyTxServiceResult(publicKey),
          ),
        );
      // Mock expected result
      // Same as service result
      const expectedResult = new Pagination<GetTransactionsResponseDto>(
        [TransactionMock.txPending0(), TransactionMock.txPending0()],
        {
          currentPage: 1,
          itemCount: 2,
          itemsPerPage: 100,
        },
        {},
      );

      //* 🎬 Act ⬇
      const result = await controller.getTransactionsByPublicKey(
        getAllByPublicKeyCommand.request,
        getAllByPublicKeyCommand.publicKey,
      );

      //* ☑️ Assert ⬇
      expect(result.items.length).toEqual(expectedResult.items.length);
      result.items.forEach((transaction: any, index: string | number) => {
        expect(transaction.id).toEqual(expectedResult.items[index].id);
        expect(transaction.transaction_message).toEqual(
          expectedResult.items[index].transaction_message,
        );
        expect(transaction.description).toEqual(
          expectedResult.items[index].description,
        );
        expect(transaction.status).toEqual(expectedResult.items[index].status);
        expect(transaction.threshold).toEqual(
          expectedResult.items[index].threshold,
        );
        expect(transaction.key_list.length).toEqual(
          expectedResult.items[index].key_list.length,
        );
        transaction.key_list.forEach(
          (key: string, keyIndex: string | number) => {
            expect(key).toEqual(expectedResult.items[index].key_list[keyIndex]);
          },
        );
        expect(transaction.signed_keys.length).toEqual(
          expectedResult.items[index].signed_keys.length,
        );
        transaction.signed_keys.forEach(
          (key: string, keyIndex: string | number) => {
            expect(key).toEqual(
              expectedResult.items[index].signed_keys[keyIndex],
            );
          },
        );
      });
    });
  });
  describe('Get Transaction', () => {
    it('should get transacion by id', async () => {
      //* 🗂️ Arrange ⬇
      const transactionId = DEFAULT.id;
      const request = HTTP_REQUEST;

      jest
        .spyOn(service, 'getById')
        .mockImplementation((transactionId: string) =>
          Promise.resolve(
            new GetTransactionsResponseDto(
              transactionId,
              DEFAULT.transaction_message,
              DEFAULT.description,
              DEFAULT.status,
              DEFAULT.threshold,
              DEFAULT.key_list,
              DEFAULT.signed_keys,
              DEFAULT.signatures,
              DEFAULT.network,
            ),
          ),
        );
      // Mock expected result
      const expectedResult = new GetTransactionsResponseDto(
        DEFAULT.id,
        DEFAULT.transaction_message,
        DEFAULT.description,
        DEFAULT.status,
        DEFAULT.threshold,
        DEFAULT.key_list,
        DEFAULT.signed_keys,
        DEFAULT.signatures,
        DEFAULT.network,
      );
      //* 🎬 Act ⬇
      const result = await controller.getTransactionById(request, transactionId);

      //* ☑️ Assert ⬇
      expect(result).toEqual(expectedResult);
    });
  });
});

//* Helper Functions
// Get Mocks
function createMockGetAllByPublicKeyTxServiceResult(
  publicKey: string,
  options?: { page?: number; limit?: number },
): Pagination<GetTransactionsResponseDto, IPaginationMeta> {
  const pendingTransaction = TransactionMock.txPending0();
  const transactionResponse = new GetTransactionsResponseDto(
    pendingTransaction.id,
    pendingTransaction.transaction_message,
    pendingTransaction.description,
    pendingTransaction.status,
    pendingTransaction.threshold,
    [publicKey, pendingTransaction.key_list[1], pendingTransaction.key_list[2]],
    pendingTransaction.signed_keys,
    pendingTransaction.signatures,
    pendingTransaction.network,
  );
  return new Pagination<GetTransactionsResponseDto>(
    [transactionResponse, transactionResponse],
    {
      currentPage: (options && options.page) || 1,
      itemCount: 2,
      itemsPerPage: 100,
    },
    {}, // TODO: meaninfull info
  );
}
