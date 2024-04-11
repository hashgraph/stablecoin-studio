/*
 *
 * Hedera Stablecoin CLI
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
  Account,
  MultiSigTransactionsViewModel,
  PublicKey,
  StableCoin,
} from '@hashgraph/stablecoin-npm-sdk';
import { utilsService } from '../../../../src/index.js';
import ListMultiSigTxService from '../../../../src/app/service/stablecoin/ListMultiSigTxService.js';
import { Status } from '../../../../src/domain/stablecoin/MultiSigTransaction.js';
import { AccountType } from '../../../../src/domain/configuration/interfaces/AccountType.js';
import ListMultiSigTxResponse from '../../../../src/domain/stablecoin/ListMultiSigTxResponse.js';
import { IAccountConfig } from '../../../../src/domain/configuration/interfaces/IAccountConfig.js';
import PaginationRequest from '../../../../src/domain/stablecoin/PaginationRequest.js';

const TRANSACTIONS = [
  {
    id: 'e8fe7d5e-2a94-472c-bab8-e693e4011300',
    transaction_message:
      '0aef022aec020a350a1a0a0c0892d5c0af0610efaedd950312080800100018c3bf0c180012080800100018c3bf0c1880c2d72f22020878320072020a0012b2020a640a20cf8c984270cd7cd25e1bd6df1a3a22ee2d1cd53a0f7bbfdf917a8bd881b11b5e1a40e120be5fa7fa085c989e69b60b6f80218d8a49751abc84456bc8bd88ba3766101b658d45ebd7e0b742382e9bd8ad98a88f03a9d6118cad42da275531e068a50b0a640a20c539f0f94cd937b721f9bd4c0b965164622798cf8ddea6169d2cb734f70baf8e1a406cf580daa232d279badbd1bc1227531d4c98ab444a2a7ec1851af17400e01c805bf96223ad2cd7a4469f3709c0fb35b77cb217543e4741d8db92175de583cc000a640a200e3c05cf1c2a04db21d0e73f0e608d80d7043851154a4d9516e6b0ee929f7f9f1a40ff79cb99db2d5001835b7ed3c26fa8a980ee541b9a1fb1c3972a6a62dfce1bd05372fed331ee1d672dc41df5ec1c12a38104962d2fb6a80dbf12286375f59c0f',
    description: 'This transaction is for the creation of a new StableCoin',
    status: Status.Pending,
    threshold: 2,
    hedera_account_id: '0.0.123456',
    key_list: [
      'cf8c984270cd7cd25e1bd6df1a3a22ee2d1cd53a0f7bbfdf917a8bd881b11b5e',
      'c539f0f94cd937b721f9bd4c0b965164622798cf8ddea6169d2cb734f70baf8e',
      '0e3c05cf1c2a04db21d0e73f0e608d80d7043851154a4d9516e6b0ee929f7f9f',
    ],
    signed_keys: [],
    signatures: [],
    network: 'testnet',
  },
  {
    id: 'e8fe7d5e-2a94-472c-bab8-e693e4011301',
    transaction_message:
      '0aef022aec020a350a1a0a0c0892d5c0af0610efaedd950312080800100018c3bf0c180012080800100018c3bf0c1880c2d72f22020878320072020a0012b2020a640a20cf8c984270cd7cd25e1bd6df1a3a22ee2d1cd53a0f7bbfdf917a8bd881b11b5e1a40e120be5fa7fa085c989e69b60b6f80218d8a49751abc84456bc8bd88ba3766101b658d45ebd7e0b742382e9bd8ad98a88f03a9d6118cad42da275531e068a50b0a640a20c539f0f94cd937b721f9bd4c0b965164622798cf8ddea6169d2cb734f70baf8e1a406cf580daa232d279badbd1bc1227531d4c98ab444a2a7ec1851af17400e01c805bf96223ad2cd7a4469f3709c0fb35b77cb217543e4741d8db92175de583cc000a640a200e3c05cf1c2a04db21d0e73f0e608d80d7043851154a4d9516e6b0ee929f7f9f1a40ff79cb99db2d5001835b7ed3c26fa8a980ee541b9a1fb1c3972a6a62dfce1bd05372fed331ee1d672dc41df5ec1c12a38104962d2fb6a80dbf12286375f59c0f',
    description: 'This transaction is for the creation of a new StableCoin',
    status: Status.Pending,
    threshold: 2,
    hedera_account_id: '0.0.123456',
    key_list: [
      'cf8c984270cd7cd25e1bd6df1a3a22ee2d1cd53a0f7bbfdf917a8bd881b11b5e',
      'c539f0f94cd937b721f9bd4c0b965164622798cf8ddea6169d2cb734f70baf8e',
      '0e3c05cf1c2a04db21d0e73f0e608d80d7043851154a4d9516e6b0ee929f7f9f',
    ],
    signed_keys: [
      'cf8c984270cd7cd25e1bd6df1a3a22ee2d1cd53a0f7bbfdf917a8bd881b11b5e',
    ],
    signatures: [
      'e120be5fa7fa085c989e69b60b6f80218d8a49751abc84456bc8bd88ba3766101b658d45ebd7e0b742382e9bd8ad98a88f03a9d6118cad42da275531e068a50b',
    ],
    network: 'testnet',
  },
  {
    id: 'e8fe7d5e-2a94-472c-bab8-e693e4011302',
    transaction_message:
      '0aef022aec020a350a1a0a0c0892d5c0af0610efaedd950312080800100018c3bf0c180012080800100018c3bf0c1880c2d72f22020878320072020a0012b2020a640a20cf8c984270cd7cd25e1bd6df1a3a22ee2d1cd53a0f7bbfdf917a8bd881b11b5e1a40e120be5fa7fa085c989e69b60b6f80218d8a49751abc84456bc8bd88ba3766101b658d45ebd7e0b742382e9bd8ad98a88f03a9d6118cad42da275531e068a50b0a640a20c539f0f94cd937b721f9bd4c0b965164622798cf8ddea6169d2cb734f70baf8e1a406cf580daa232d279badbd1bc1227531d4c98ab444a2a7ec1851af17400e01c805bf96223ad2cd7a4469f3709c0fb35b77cb217543e4741d8db92175de583cc000a640a200e3c05cf1c2a04db21d0e73f0e608d80d7043851154a4d9516e6b0ee929f7f9f1a40ff79cb99db2d5001835b7ed3c26fa8a980ee541b9a1fb1c3972a6a62dfce1bd05372fed331ee1d672dc41df5ec1c12a38104962d2fb6a80dbf12286375f59c0f',
    description: 'This transaction is for the creation of a new StableCoin',
    status: Status.Signed,
    threshold: 2,
    hedera_account_id: '0.0.123456',
    key_list: [
      'cf8c984270cd7cd25e1bd6df1a3a22ee2d1cd53a0f7bbfdf917a8bd881b11b5e',
      'c539f0f94cd937b721f9bd4c0b965164622798cf8ddea6169d2cb734f70baf8e',
      '0e3c05cf1c2a04db21d0e73f0e608d80d7043851154a4d9516e6b0ee929f7f9f',
    ],
    signed_keys: [
      'cf8c984270cd7cd25e1bd6df1a3a22ee2d1cd53a0f7bbfdf917a8bd881b11b5e',
      'c539f0f94cd937b721f9bd4c0b965164622798cf8ddea6169d2cb734f70baf8e',
    ],
    signatures: [
      'e120be5fa7fa085c989e69b60b6f80218d8a49751abc84456bc8bd88ba3766101b658d45ebd7e0b742382e9bd8ad98a88f03a9d6118cad42da275531e068a50b',
      '6cf580daa232d279badbd1bc1227531d4c98ab444a2a7ec1851af17400e01c805bf96223ad2cd7a4469f3709c0fb35b77cb217543e4741d8db92175de583cc00',
    ],
    network: 'testnet',
  },
  {
    id: 'e8fe7d5e-2a94-472c-bab8-e693e4011303',
    transaction_message:
      '0aef022aec020a350a1a0a0c0892d5c0af0610efaedd950312080800100018c3bf0c180012080800100018c3bf0c1880c2d72f22020878320072020a0012b2020a640a20cf8c984270cd7cd25e1bd6df1a3a22ee2d1cd53a0f7bbfdf917a8bd881b11b5e1a40e120be5fa7fa085c989e69b60b6f80218d8a49751abc84456bc8bd88ba3766101b658d45ebd7e0b742382e9bd8ad98a88f03a9d6118cad42da275531e068a50b0a640a20c539f0f94cd937b721f9bd4c0b965164622798cf8ddea6169d2cb734f70baf8e1a406cf580daa232d279badbd1bc1227531d4c98ab444a2a7ec1851af17400e01c805bf96223ad2cd7a4469f3709c0fb35b77cb217543e4741d8db92175de583cc000a640a200e3c05cf1c2a04db21d0e73f0e608d80d7043851154a4d9516e6b0ee929f7f9f1a40ff79cb99db2d5001835b7ed3c26fa8a980ee541b9a1fb1c3972a6a62dfce1bd05372fed331ee1d672dc41df5ec1c12a38104962d2fb6a80dbf12286375f59c0f',
    description: 'This transaction is for the creation of a new StableCoin',
    status: Status.Signed,
    threshold: 2,
    hedera_account_id: '0.0.123456',
    key_list: [
      'cf8c984270cd7cd25e1bd6df1a3a22ee2d1cd53a0f7bbfdf917a8bd881b11b5e',
      'c539f0f94cd937b721f9bd4c0b965164622798cf8ddea6169d2cb734f70baf8e',
      '0e3c05cf1c2a04db21d0e73f0e608d80d7043851154a4d9516e6b0ee929f7f9f',
    ],
    signed_keys: [
      'cf8c984270cd7cd25e1bd6df1a3a22ee2d1cd53a0f7bbfdf917a8bd881b11b5e',
      'c539f0f94cd937b721f9bd4c0b965164622798cf8ddea6169d2cb734f70baf8e',
      '0e3c05cf1c2a04db21d0e73f0e608d80d7043851154a4d9516e6b0ee929f7f9f',
    ],
    signatures: [
      'e120be5fa7fa085c989e69b60b6f80218d8a49751abc84456bc8bd88ba3766101b658d45ebd7e0b742382e9bd8ad98a88f03a9d6118cad42da275531e068a50b',
      '6cf580daa232d279badbd1bc1227531d4c98ab444a2a7ec1851af17400e01c805bf96223ad2cd7a4469f3709c0fb35b77cb217543e4741d8db92175de583cc00',
      'ff79cb99db2d5001835b7ed3c26fa8a980ee541b9a1fb1c3972a6a62dfce1bd05372fed331ee1d672dc41df5ec1c12a38104962d2fb6a80dbf12286375f59c0f',
    ],
    network: 'testnet',
  },
];
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 5;
const DEFAULT_ACCOUNT: IAccountConfig = {
  accountId: '0.0.123456',
  type: AccountType.SelfCustodial,
  network: 'testnet',
  alias: 'Test Account',
  selfCustodial: {
    privateKey: {
      key: '0x0123456789abcdefABCDEF',
      type: 'ed25519',
    },
  },
};
const EXAMPLE_PUBLIC_KEY = new PublicKey('0x04123456789abcdefABCDEF');
const mocks: Record<string, jest.SpyInstance> = {};

describe('List Multi-Signature Transactions Service', () => {
  beforeAll(() => {
    // Mock all unwanted outputs
    mocks.showSpinner = jest
      .spyOn(utilsService, 'showSpinner')
      .mockImplementation();
    mocks.log = jest.spyOn(console, 'log').mockImplementation();
    mocks.info = jest.spyOn(console, 'info').mockImplementation();
    mocks.error = jest.spyOn(console, 'error').mockImplementation();
    mocks.drawTable = jest
      .spyOn(utilsService, 'drawTableListPendingMultiSig')
      .mockImplementation();
  });
  afterAll(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Get list', () => {
    beforeAll(() => {
      // Mock expected function behavior
      // At any given account, return a fixed example public key
      mocks.getPublicKey = jest
        .spyOn(Account, 'getPublicKey')
        .mockImplementation((request) => {
          if (request.account.accountId.includes('0.0.')) {
            return Promise.resolve(EXAMPLE_PUBLIC_KEY);
          }
          return undefined;
        });
      // Return a fixed list of transactions based on status and pagination
      mocks.getTransactions = jest
        .spyOn(StableCoin, 'getTransactions')
        .mockImplementation(
          ({ status, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT }) => {
            const filteredTransactions = TRANSACTIONS.filter(
              (tx) => tx.status === status,
            );
            const paginatedTransactions = filteredTransactions.slice(
              (page - 1) * limit,
              page * limit,
            );
            const totalItems = paginatedTransactions.length;
            const paginationRes: MultiSigTransactionsViewModel['pagination'] = {
              currentPage: page,
              itemsPerPage: limit,
              totalItems: totalItems,
              totalPages: Math.ceil(totalItems / limit),
              itemCount: paginatedTransactions.length,
            };
            return Promise.resolve({
              transactions: paginatedTransactions,
              pagination: paginationRes,
            } as MultiSigTransactionsViewModel);
          },
        );
    });

    it('should get Tx list without parameters, from multisig account', async () => {
      //* 🗂️ Arrange
      const CURRENT_ACCOUNT: IAccountConfig = {
        ...DEFAULT_ACCOUNT,
        type: AccountType.MultiSignature,
        selfCustodial: undefined,
      };
      mocks.getCurrentAccount = jest
        .spyOn(utilsService, 'getCurrentAccount')
        .mockReturnValue(CURRENT_ACCOUNT);
      //* 🎬 Act
      const result = await new ListMultiSigTxService().get();

      //* 🕵️ Assert
      expect(mocks.getCurrentAccount).toHaveBeenCalledTimes(1);
      expect(mocks.getPublicKey).toHaveBeenCalledTimes(0); // Account type == MultiSig
      expect(mocks.getTransactions).toHaveBeenCalledTimes(1);
      expect(mocks.drawTable).toHaveBeenCalledTimes(0);
      expect(mocks.getTransactions).toHaveBeenCalledWith(
        expect.objectContaining({
          account: CURRENT_ACCOUNT.accountId,
          publicKey: undefined,
          status: Status.Pending,
          page: DEFAULT_PAGE,
          limit: DEFAULT_LIMIT,
        }),
      );
      expect(result).toBeInstanceOf(ListMultiSigTxResponse);
      expect(result.multiSigTxList).toHaveLength(2);
      expect(result.multiSigTxList[0].status).toBe(Status.Pending);
      expect(result.pagination.currentPage).toBeGreaterThan(0);
      expect(result.pagination.totalItems).toBe(2);
    });
    it('should get Tx list with status = signed and draw, from self-custodial', async () => {
      //* 🗂️ Arrange
      mocks.getCurrentAccount = jest
        .spyOn(utilsService, 'getCurrentAccount')
        .mockReturnValue(DEFAULT_ACCOUNT);

      //* 🎬 Act
      const result = await new ListMultiSigTxService().get({
        status: Status.Signed,
        draw: true,
      });

      //* 🕵️ Assert
      expect(mocks.getCurrentAccount).toHaveBeenCalledTimes(1);
      expect(mocks.getPublicKey).toHaveBeenCalledTimes(1); // Account type == self-custodial
      expect(mocks.getTransactions).toHaveBeenCalledTimes(1);
      expect(mocks.drawTable).toHaveBeenCalledTimes(1);
      expect(mocks.getPublicKey).toHaveBeenCalledWith(
        expect.objectContaining({
          account: { accountId: DEFAULT_ACCOUNT.accountId },
        }),
      );
      expect(mocks.getTransactions).toHaveBeenCalledWith(
        expect.objectContaining({
          account: undefined,
          publicKey: EXAMPLE_PUBLIC_KEY,
          status: Status.Signed,
          page: DEFAULT_PAGE,
          limit: DEFAULT_LIMIT,
        }),
      );
      expect(result).toBeInstanceOf(ListMultiSigTxResponse);
      expect(result.multiSigTxList).toHaveLength(2);
      expect(result.multiSigTxList[0].status).toBe(Status.Signed);
      expect(result.pagination.currentPage).toBeGreaterThan(0);
      expect(result.pagination.totalItems).toBe(2);
    });

    it('should get Tx list with custom pagination', async () => {
      //* 🗂️ Arrange
      const PAGINATION = new PaginationRequest({ page: 1, limit: 1 });
      mocks.getCurrentAccount = jest
        .spyOn(utilsService, 'getCurrentAccount')
        .mockReturnValue(DEFAULT_ACCOUNT);

      //* 🎬 Act
      const result = await new ListMultiSigTxService().get({
        status: Status.Pending,
        pagination: PAGINATION,
        draw: false,
      });

      //* 🕵️ Assert
      expect(mocks.getCurrentAccount).toHaveBeenCalledTimes(1);
      expect(mocks.getPublicKey).toHaveBeenCalledTimes(1); // Account type == self-custodial
      expect(mocks.getTransactions).toHaveBeenCalledTimes(1);
      expect(mocks.drawTable).toHaveBeenCalledTimes(0);
      expect(mocks.getPublicKey).toHaveBeenCalledWith(
        expect.objectContaining({
          account: { accountId: DEFAULT_ACCOUNT.accountId },
        }),
      );
      expect(mocks.getTransactions).toHaveBeenCalledWith(
        expect.objectContaining({
          account: undefined,
          publicKey: EXAMPLE_PUBLIC_KEY,
          status: Status.Pending,
          page: PAGINATION.page,
          limit: PAGINATION.limit,
        }),
      );
      expect(result).toBeInstanceOf(ListMultiSigTxResponse);
      expect(result.multiSigTxList).toHaveLength(PAGINATION.limit);
      expect(result.multiSigTxList[0].status).toBe(Status.Pending);
      expect(result.pagination.currentPage).toBeGreaterThan(0);
      expect(result.pagination.currentPage).toBe(PAGINATION.page);
      expect(result.pagination.totalItems).toBe(PAGINATION.limit);
    });
  });
});
