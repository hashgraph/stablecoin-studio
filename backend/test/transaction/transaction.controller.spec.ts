import { Test } from '@nestjs/testing';
import TransactionController from 'src/transaction/transaction.controller';
import { Transaction } from 'src/transaction/transaction.entity';
import TransactionService from 'src/transaction/transaction.service';

describe('Transaction Controller Test', () => {
  let transactionController: TransactionController;
  let transactionService: TransactionService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [TransactionService],
    }).compile();

    transactionService = moduleRef.get<TransactionService>(TransactionService);
    transactionController = moduleRef.get<TransactionController>(
      TransactionController,
    );
  });

  describe('Create Transaction', () => {
    it('should create a new transaction', async () => {
      const result = createMockTransaction();
      jest
        .spyOn(transactionService, 'create')
        .mockImplementation(() => Promise.resolve(result));

      expect(await transactionController.addTransaction()).toBe(result);
    });
  });
});

// Example function to create a mock Transaction object
function createMockTransaction(): Transaction {
  const transaction = new Transaction();
  transaction.id = '123e4567-e89b-12d3-a456-426614174000'; // UUID for the transaction
  transaction.transaction_message = 'Payment for services rendered';
  transaction.description = 'Monthly web hosting fee';
  transaction.hedera_account_id = '0.0.123456';
  transaction.signed_messages = ['signature1', 'signature2'];
  transaction.key_list = ['key1', 'key2'];
  transaction.signed_keys = ['signedKey1', 'signedKey2'];
  transaction.status = 'SIGNED'; // or 'PENDING' depending on the test case
  transaction.threshold = 2;

  return transaction;
}
