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

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import TransactionService from '../../src/transaction/transaction.service';
import Transaction from '../../src/transaction/transaction.entity';
import { SignTransactionRequestDto } from '../../src/transaction/dto/sign-transaction-request.dto';
import TransactionMock, { DEFAULT } from './transaction.mock';
import { LoggerService } from '../../src/logger/logger.service';
import { TransactionStatus } from '../../src/transaction/status.enum';

describe('Transaction Service Test', () => {
  let service: TransactionService;
  let repository: Repository<Transaction>;
  const repositoryToken = getRepositoryToken(Transaction);

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        ConfigService,
        {
          provide: repositoryToken,
          useClass: Repository,
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
          },
        },
      ],
    }).compile();

    service = testingModule.get<TransactionService>(TransactionService);
    repository = testingModule.get<Repository<Transaction>>(repositoryToken);

    // Mock common repository methods
    jest
      .spyOn(repository, 'create')
      .mockImplementation(
        (transaction) => ({ ...transaction, id: DEFAULT.id }) as Transaction,
      );
    jest
      .spyOn(repository, 'save')
      .mockImplementation((transaction) =>
        Promise.resolve(transaction as Transaction),
      );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });
  describe('Create transaction', () => {
    it('should create a transaction', async () => {
      //* 🗂️ Arrange ⬇
      const pendingTransaction = TransactionMock.txPending0();
      const createTransactionDto = {
        transaction_message: pendingTransaction.transaction_message,
        description: pendingTransaction.description,
        hedera_account_id: pendingTransaction.hedera_account_id,
        key_list: pendingTransaction.key_list,
        threshold: pendingTransaction.threshold,
        network: pendingTransaction.network,
      };

      const expected = TransactionMock.txPending0();
      //* 🎬 Act ⬇
      const transaction = await service.create(createTransactionDto);

      //* ☑️ Assert ⬇
      expect(transaction).toBeDefined();
      expected.assert({ transaction });
    });
    it('should create a transaction removing duplicated keys', async () => {
      //* 🗂️ Arrange ⬇
      const pendingTransaction = TransactionMock.txPending0();
      const expected = TransactionMock.txPending0();

      const key_list_duplicated: string[] = [];
      pendingTransaction.key_list.forEach((key) =>
        key_list_duplicated.push(key),
      );

      key_list_duplicated.push(key_list_duplicated[0]);

      const createTransactionDto = {
        transaction_message: pendingTransaction.transaction_message,
        description: pendingTransaction.description,
        hedera_account_id: pendingTransaction.hedera_account_id,
        key_list: key_list_duplicated,
        threshold: pendingTransaction.threshold,
        network: pendingTransaction.network,
      };

      //* 🎬 Act ⬇
      const transaction = await service.create(createTransactionDto);

      //* ☑️ Assert ⬇
      expect(transaction).toBeDefined();
      expected.assert({ transaction });
    });
    it('should create a transaction with threshold equal to key list length', async () => {
      //* 🗂️ Arrange ⬇
      const pendingTransaction = TransactionMock.txPending0();
      const expected = TransactionMock.txPending0();

      expected.threshold = pendingTransaction.key_list.length;
      const new_threshold = pendingTransaction.key_list.length + 1;

      const createTransactionDto = {
        transaction_message: pendingTransaction.transaction_message,
        description: pendingTransaction.description,
        hedera_account_id: pendingTransaction.hedera_account_id,
        key_list: pendingTransaction.key_list,
        threshold: new_threshold,
        network: pendingTransaction.network,
      };

      //* 🎬 Act ⬇
      const transaction = await service.create(createTransactionDto);

      //* ☑️ Assert ⬇
      expect(transaction).toBeDefined();
      expected.assert({ transaction });
    });

    it('should create a transaction with threshold equal to 0', async () => {
      //* 🗂️ Arrange ⬇
      const THRESHOLD = 0;
      const pendingTransaction = TransactionMock.txPending0({
        threshold: THRESHOLD,
      });
      const createTransactionDto = {
        transaction_message: pendingTransaction.transaction_message,
        description: pendingTransaction.description,
        hedera_account_id: pendingTransaction.hedera_account_id,
        key_list: pendingTransaction.key_list,
        threshold: pendingTransaction.threshold,
        network: pendingTransaction.network,
      };

      const expected = TransactionMock.txPending0({
        threshold: createTransactionDto.key_list.length,
      });
      //* 🎬 Act ⬇
      const transaction = await service.create(createTransactionDto);

      //* ☑️ Assert ⬇
      expect(transaction).toBeDefined();
      expected.assert({ transaction });
    });
  });
  describe('Sign transaction', () => {
    it('should sign a transaction in pending and remain in pending', async () => {
      //* 🗂️ Arrange ⬇
      const THRESHOLD = 2;
      const thresholdTransaction = TransactionMock.txSignedThreshold({
        threshold: THRESHOLD,
      });
      // Mock Input
      const signTransactionDto = {
        signature: thresholdTransaction.signatures[0],
        public_key: thresholdTransaction.key_list[0],
      } as SignTransactionRequestDto;
      const signTransactionCommand = {
        body: signTransactionDto,
        txId: thresholdTransaction.id,
      };
      // Mock the repository
      jest.spyOn(repository, 'findOne').mockImplementation(() =>
        Promise.resolve(
          new TransactionMock({
            id: signTransactionCommand.txId,
            threshold: THRESHOLD,
            status: TransactionStatus.PENDING,
            signed_keys: [],
            signatures: [],
          }),
        ),
      );
      // Mock expected result
      const expected = new TransactionMock({
        id: signTransactionCommand.txId,
        threshold: THRESHOLD,
        status: TransactionStatus.PENDING,
        signed_keys: [signTransactionDto.public_key],
        signatures: [signTransactionDto.signature],
      });

      //* 🎬 Act ⬇
      const transaction = await service.sign(
        signTransactionCommand.body,
        signTransactionCommand.txId,
      );

      //* ☑️ Assert ⬇
      expect(transaction).toBeDefined();
      expected.assert({ transaction });
    });
    it('should sign a transaction in pending and change to sign', async () => {
      //* 🗂️ Arrange ⬇
      const THRESHOLD = 2;
      // Mock Input
      const thresholdTransaction = TransactionMock.txSignedThreshold({
        threshold: THRESHOLD,
      });
      const signTransactionDto = {
        signature: thresholdTransaction.signatures[1],
        public_key: thresholdTransaction.key_list[1],
      } as SignTransactionRequestDto;
      const signTransactionCommand = {
        body: signTransactionDto,
        txId: thresholdTransaction.id,
      };
      // Mock the repository
      jest.spyOn(repository, 'findOne').mockImplementation(() =>
        Promise.resolve(
          new TransactionMock({
            id: signTransactionCommand.txId,
            threshold: THRESHOLD,
            status: TransactionStatus.PENDING,
            signed_keys: [thresholdTransaction.key_list[0]],
            signatures: [thresholdTransaction.signatures[0]],
          }),
        ),
      );
      // Mock expected result
      const expected = new TransactionMock({
        id: signTransactionCommand.txId,
        threshold: THRESHOLD,
        status: TransactionStatus.SIGNED,
        signed_keys: [DEFAULT.key_list[0], signTransactionDto.public_key],
        signatures: [DEFAULT.signatures[0], signTransactionDto.signature],
      });

      //* 🎬 Act ⬇
      const transaction = await service.sign(
        signTransactionCommand.body,
        signTransactionCommand.txId,
      );

      //* ☑️ Assert ⬇
      expect(transaction).toBeDefined();
      expected.assert({ transaction });
    });
  });
  describe('Delete all transactions', () => {
    it('should delete all transactions from DB', async () => {
      jest.spyOn(repository, 'clear').mockResolvedValue(undefined);

      await service.deleteAllTransactions();

      expect(repository.clear).toHaveBeenCalled();
    });
  });
  describe('Get transaction', () => {
    it('should get a transaction by id', async () => {
      const transaction = TransactionMock.txPending0();
      jest.spyOn(repository, 'findOne').mockResolvedValue(transaction);

      const result = await service.getById(transaction.id);

      expect(result).toEqual(
        expect.objectContaining({
          id: transaction.id,
          transaction_message: transaction.transaction_message,
          description: transaction.description,
          status: transaction.status,
          threshold: transaction.threshold,
          // hedera_account_id is not returned
          key_list: transaction.key_list,
          signed_keys: transaction.signed_keys,
          signatures: transaction.signatures,
          network: transaction.network,
        }),
      );
    });
  });
});
