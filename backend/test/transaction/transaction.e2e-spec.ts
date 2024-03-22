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
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DEFAULT } from './transaction.mock';
import { CreateTransactionRequestDto } from '../../src/transaction/dto/create-transaction-request.dto';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../src/logger/logger.service';
import { uuidRegex } from '../../src/common/regexp';
import { SignTransactionRequestDto } from '../../src/transaction/dto/sign-transaction-request.dto';

const transactionIds: string[] = [];

describe('Transaction Controller (e2e)', () => {
  let app: INestApplication;
  const configService = new ConfigService();

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(LoggerService)
      .useValue({
        log: jest.fn(),
        debug: jest.fn(),
        error: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/api/transactions (POST) - Create', () => {
    it('should create a new transaction', () => {
      // Mock body
      const bodyMock: CreateTransactionRequestDto = {
        transaction_message: DEFAULT.transaction_message,
        description: DEFAULT.description,
        threshold: DEFAULT.threshold,
        hedera_account_id: DEFAULT.hedera_account_id,
        key_list: DEFAULT.key_list,
        network: DEFAULT.network,
      };
      return request(app.getHttpServer())
        .post('/api/transactions')
        .set('Origin', configService.get('ORIGIN'))
        .send(bodyMock)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('transactionId');
          expect(uuidRegex.test(res.body.transactionId)).toBe(true);
          // Save transactionId for future tests
          transactionIds.push(res.body.transactionId);
          // TODO check with GET /api/transactions/:id
        });
    });
    it('should create a new transaction with a threshold of 0', () => {
      // Mock body
      const THRESHOLD = 0;
      const bodyMock: CreateTransactionRequestDto = {
        transaction_message: DEFAULT.transaction_message,
        description: DEFAULT.description,
        threshold: THRESHOLD,
        hedera_account_id: DEFAULT.hedera_account_id,
        key_list: DEFAULT.key_list,
        network: DEFAULT.network,
      };
      return request(app.getHttpServer())
        .post('/api/transactions')
        .set('Origin', configService.get('ORIGIN'))
        .send(bodyMock)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('transactionId');
          expect(uuidRegex.test(res.body.transactionId)).toBe(true);
          // Save transactionId for future tests
          transactionIds.push(res.body.transactionId);
          // TODO check with GET /api/transactions/:id
        });
    });
  });

  describe('/api/transactions/:transactionId (PUT) - Sign', () => {
    // eslint-disable-next-line jest/expect-expect
    it('should sign a transaction', () => {
      // get transactionId
      const transactionId = transactionIds[0];
      console.log('transactionId', transactionId);
      const bodyMock = {
        public_key: DEFAULT.key_list[0],
        signature: DEFAULT.signatures[0],
      } as SignTransactionRequestDto;
      return request(app.getHttpServer())
        .put(`/api/transactions/${transactionId}`)
        .set('Origin', configService.get('ORIGIN'))
        .send(bodyMock)
        .expect(204);
    });
  });

  describe('/api/transactions/:transactionId (DELETE) - Delete', () => {
    // eslint-disable-next-line jest/expect-expect
    it('should delete a transaction', () => {
      // Mock body
      const transactionId = transactionIds[0];
      return request(app.getHttpServer())
        .delete(`/api/transactions/${transactionId}`)
        .set('Origin', configService.get('ORIGIN'))
        .expect(200);
    });
  });

  describe('/api/transactions (GET) - GetAll', () => {
    it('should get all transactions', () => {
      return request(app.getHttpServer())
        .get('/api/transactions')
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeInstanceOf(Object);
          expect(res.body.items).toBeInstanceOf(Array);
          expect(res.body.items.length).toBeGreaterThan(0);
          expect(res.body.items[0]).toBeInstanceOf(Object);
        });
    });
  });
});
