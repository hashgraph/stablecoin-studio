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

import { UUID } from 'crypto';
import Transaction from '../../src/transaction/transaction.entity';
import { Network } from '../../src/transaction/network.enum';
import { TransactionStatus } from '../../src/transaction/status.enum';

export const DEFAULT = {
  id: 'e8fe7d5e-2a94-472c-bab8-e693e401134f',
  transaction_message:
    '0a1a0a0c0892d5c0af0610efaedd950312080800100018c3bf0c180012080800100018c3bf0c1880c2d72f22020878320072020a00',
  description: 'This transaction is for the creation of a new StableCoin',
  status: TransactionStatus.SIGNED,
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
  network: Network.TESTNET,
} as TransactionMock;

interface TransactionMockCommand {
  id?: UUID;
  transaction_message?: string;
  description?: string;
  status?: TransactionStatus;
  threshold?: number;
  hedera_account_id?: string;
  key_list?: string[];
  signed_keys?: string[];
  signatures?: string[];
}

export default class TransactionMock extends Transaction {
  constructor({
    id = DEFAULT.id,
    transaction_message = DEFAULT.transaction_message,
    description = DEFAULT.description,
    status = DEFAULT.status,
    threshold = DEFAULT.threshold,
    hedera_account_id = DEFAULT.hedera_account_id,
    key_list = DEFAULT.key_list,
    signed_keys = DEFAULT.signed_keys,
    signatures = DEFAULT.signatures,
    network = DEFAULT.network,
  } = {}) {
    super();
    this.id = id;
    this.transaction_message = transaction_message;
    this.description = description;
    this.status = status;
    this.threshold = threshold;
    this.hedera_account_id = hedera_account_id;
    this.key_list = key_list;
    this.signed_keys = signed_keys;
    this.signatures = signatures;
    this.network = network;
  }

  static txPending0(command: Partial<TransactionMockCommand> = {}) {
    return new TransactionMock({
      id: DEFAULT.id,
      transaction_message: DEFAULT.transaction_message,
      description: DEFAULT.description,
      status: TransactionStatus.PENDING,
      threshold: DEFAULT.threshold,
      hedera_account_id: DEFAULT.hedera_account_id,
      key_list: DEFAULT.key_list,
      signed_keys: [],
      signatures: [],
      network: Network.TESTNET,
      ...command,
    });
  }
  static txPending1(command: Partial<TransactionMockCommand> = {}) {
    const base = TransactionMock.txPending0();
    return new TransactionMock({
      ...base,
      signed_keys: [base.key_list[0]],
      signatures: [DEFAULT.signatures[0]],
      ...command,
    });
  }
  static txSignedThreshold(command: Partial<TransactionMockCommand> = {}) {
    const base = TransactionMock.txPending1();
    return new TransactionMock({
      ...base,
      status: TransactionStatus.SIGNED,
      signed_keys: [base.key_list[0], base.key_list[1]],
      signatures: [base.signatures[0], DEFAULT.signatures[1]],
      ...command,
    });
  }
  static txSignedMax(command: Partial<TransactionMockCommand> = {}) {
    const base = TransactionMock.txSignedThreshold();
    return new TransactionMock({
      ...base,
      signed_keys: base.key_list,
      signatures: [...base.signatures, DEFAULT.signatures[2]],
      ...command,
    });
  }

  /* eslint-disable jest/no-standalone-expect */
  assert({
    transaction,
    disableChecks = {},
  }: {
    transaction: Transaction;
    disableChecks?: Partial<Record<keyof Transaction, boolean>>;
  }): void {
    if (!disableChecks.id) {
      expect(transaction.id).toBeDefined();
      expect(transaction.id).toBe(this.id);
    }
    if (!disableChecks.transaction_message) {
      expect(transaction.transaction_message).toBe(this.transaction_message);
    }
    if (!disableChecks.description) {
      expect(transaction.description).toBe(this.description);
    }
    if (!disableChecks.status) {
      expect(transaction.status).toBe(this.status);
    }
    if (!disableChecks.threshold) {
      expect(transaction.threshold).toBe(this.threshold);
    }
    if (!disableChecks.hedera_account_id) {
      expect(transaction.hedera_account_id).toBe(this.hedera_account_id);
    }
    if (!disableChecks.key_list) {
      expect(transaction.key_list.length).toBe(this.key_list.length);
      transaction.key_list.forEach((key, i) => {
        expect(key).toBe(this.key_list[i]);
      });
    }
    if (!disableChecks.signed_keys) {
      expect(transaction.signed_keys.length).toBe(this.signed_keys.length);
      transaction.signed_keys.forEach((key, i) => {
        expect(key).toBe(this.signed_keys[i]);
      });
    }
    if (!disableChecks.signatures) {
      expect(transaction.signatures.length).toBe(this.signatures.length);
      transaction.signatures.forEach((signature, i) => {
        expect(signature).toBe(this.signatures[i]);
      });
    }
    if (!disableChecks.network) {
      expect(transaction.network).toBe(this.network);
    }
  }
}
