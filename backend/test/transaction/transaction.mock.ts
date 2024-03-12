import { UUID, randomUUID } from 'crypto';
import Transaction, {
  TransactionStatus,
} from '../../src/transaction/transaction.entity';

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

const DEFAULT = {
  txPending0: null,
  txPending1: null,
  txSignedThreshold: null,
  txSignedMax: null,
};

DEFAULT.txPending0 = {
  id: randomUUID(),
  transaction_message:
    '858076a8dde510aa28bf7ac5aa65a447ded08712e83d149fa71712ac7f01b6febf6326b8c15832d54a1d8f9f690dd865',
  description: 'This transaction is for the creation of a new StableCoin',
  status: TransactionStatus.PENDING,
  threshold: 2,
  hedera_account_id: '0.0.123456',
  key_list: [
    '302a300506032b6570032100cf8c984270cd7cd25e1bd6df1a3a22ee2d1cd53a0f7bbfdf917a8bd881b11b5e',
    '302a300506032b6570032100c539f0f94cd937b721f9bd4c0b965164622798cf8ddea6169d2cb734f70baf8e',
    '302a300506032b65700321000e3c05cf1c2a04db21d0e73f0e608d80d7043851154a4d9516e6b0ee929f7f9f',
  ],
  signed_keys: [],
  signatures: [],
};

DEFAULT.txPending1 = {
  ...DEFAULT.txPending0,
  signed_keys: [DEFAULT.txPending0.key_list[0]],
  signatures: [
    'd211c25d68b77f46edfb7b25a91fd9fa41881e8b302b549b27c9c10f231b983249253f6f6df2a23d858fbdb1262db138f9000ad5465649ae5c714145bd12030f',
  ],
};

DEFAULT.txSignedThreshold = {
  ...DEFAULT.txPending1,
  status: TransactionStatus.SIGNED,
  signed_keys: [DEFAULT.txPending1.key_list[0], DEFAULT.txPending0.key_list[1]],
  signatures: [
    DEFAULT.txPending1.signatures[0],
    'ac61e05c58a370f91ec1b0e31ee0a6322c80a5323a3866f7b8e3208f1827a896018e47bf4776f740d7d1798340e4abd82e14dde7e2c059868d3a3d0839661a0d',
  ],
};

DEFAULT.txSignedMax = {
  ...DEFAULT.txSignedThreshold,
  signed_keys: [
    ...DEFAULT.txSignedThreshold.signed_keys,
    DEFAULT.txPending0.key_list[2],
  ],
  signatures: [
    ...DEFAULT.txSignedThreshold.signatures,
    '03a22c4e10e15e50bd15e3f0ba9ff0f225be1b3eb82378817846bd24be0b5ef6d6041eee87cbe16e317255255f5e01bea64a72e89a980c6dbd2f010aebdfc904',
  ],
};

export { DEFAULT };

export default class TransactionMock extends Transaction {
  constructor({
    id = DEFAULT.txSignedThreshold.id,
    transaction_message = DEFAULT.txSignedThreshold.transaction_message,
    description = DEFAULT.txSignedThreshold.description,
    status = DEFAULT.txSignedThreshold.status,
    threshold = DEFAULT.txSignedThreshold.threshold,
    hedera_account_id = DEFAULT.txSignedThreshold.hedera_account_id,
    key_list = DEFAULT.txSignedThreshold.key_list,
    signed_keys = DEFAULT.txSignedThreshold.signed_keys,
    signatures = DEFAULT.txSignedThreshold.signatures,
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
  }

  static txPending0(command: Partial<TransactionMockCommand> = {}) {
    return new TransactionMock({
      ...DEFAULT.txPending0,
      ...command,
    });
  }
  static txPending1(command: Partial<TransactionMockCommand> = {}) {
    return new TransactionMock({
      ...DEFAULT.txPending1,
      ...command,
    });
  }
  static txSignedThreshold(command: Partial<TransactionMockCommand> = {}) {
    return new TransactionMock({
      ...DEFAULT.txSignedThreshold,
      ...command,
    });
  }
  static txSignedMax(command: Partial<TransactionMockCommand> = {}) {
    return new TransactionMock({
      ...DEFAULT.txSignedMax,
      ...command,
    });
  }

  assert(transaction: Transaction) {
    expect(transaction.id).toBeDefined();
    expect(transaction.id).toBe(this.id);
    expect(transaction.transaction_message).toBe(this.transaction_message);
    expect(transaction.description).toBe(this.description);
    expect(transaction.status).toBe(this.status);
    expect(transaction.threshold).toBe(this.threshold);
    expect(transaction.hedera_account_id).toBe(this.hedera_account_id);
    expect(transaction.key_list.length).toBe(this.key_list.length);
    transaction.key_list.forEach((key, i) => {
      expect(key).toBe(this.key_list[i]);
    });
    expect(transaction.signed_keys.length).toBe(this.signed_keys.length);
    transaction.signed_keys.forEach((key, i) => {
      expect(key).toBe(this.signed_keys[i]);
    });
    expect(transaction.signatures.length).toBe(this.signatures.length);
    transaction.signatures.forEach((signature, i) => {
      expect(signature).toBe(this.signatures[i]);
    });
  }
}
