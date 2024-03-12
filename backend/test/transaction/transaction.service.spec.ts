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
import Transaction, {
  TransactionStatus,
} from '../../src/transaction/transaction.entity';
import { SignTransactionRequestDto } from '../../src/transaction/dto/sign-transaction-request.dto';
import TransactionMock, { DEFAULT } from './transaction.mock';
import { LoggerService } from '../../src/logger/logger.service';

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
        (transaction) =>
          ({ ...transaction, id: DEFAULT.txPending0.id }) as Transaction,
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
      const createTransactionDto = {
        transaction_message: DEFAULT.txPending0.transaction_message,
        description: DEFAULT.txPending0.description,
        hedera_account_id: DEFAULT.txPending0.hedera_account_id,
        key_list: DEFAULT.txPending0.key_list,
        threshold: DEFAULT.txPending0.threshold,
      };

      const expected = TransactionMock.txPending0();
      //* 🎬 Act ⬇
      const transaction = await service.create(createTransactionDto);

      //* ☑️ Assert ⬇
      expect(transaction).toBeDefined();
      expected.assert({ transaction });
    });
    it('should create a transaction with threshold equal to 0', async () => {
      //* 🗂️ Arrange ⬇
      const THRESHOLD = 0;
      const createTransactionDto = {
        transaction_message: DEFAULT.txPending0.transaction_message,
        description: DEFAULT.txPending0.description,
        hedera_account_id: DEFAULT.txPending0.hedera_account_id,
        key_list: DEFAULT.txPending0.key_list,
        threshold: THRESHOLD,
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
      // Mock Input
      const signTransactionDto = {
        signature: DEFAULT.txSignedThreshold.signatures[0],
        public_key: DEFAULT.txSignedThreshold.key_list[0],
      } as SignTransactionRequestDto;
      const signTransactionCommand = {
        body: signTransactionDto,
        txId: DEFAULT.txSignedThreshold.id,
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
      const signTransactionDto = {
        signature: DEFAULT.txSignedThreshold.signatures[1],
        public_key: DEFAULT.txSignedThreshold.key_list[1],
      } as SignTransactionRequestDto;
      const signTransactionCommand = {
        body: signTransactionDto,
        txId: DEFAULT.txSignedThreshold.id,
      };
      // Mock the repository
      jest.spyOn(repository, 'findOne').mockImplementation(() =>
        Promise.resolve(
          new TransactionMock({
            id: signTransactionCommand.txId,
            threshold: THRESHOLD,
            status: TransactionStatus.PENDING,
            signed_keys: [DEFAULT.txSignedThreshold.key_list[0]],
            signatures: [DEFAULT.txSignedThreshold.signatures[0]],
          }),
        ),
      );
      // Mock expected result
      const expected = new TransactionMock({
        id: signTransactionCommand.txId,
        threshold: THRESHOLD,
        status: TransactionStatus.SIGNED,
        signed_keys: [
          DEFAULT.txSignedThreshold.key_list[0],
          signTransactionDto.public_key,
        ],
        signatures: [
          DEFAULT.txSignedThreshold.signatures[0],
          signTransactionDto.signature,
        ],
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
});
