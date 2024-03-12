import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import TransactionService from '../../src/transaction/transaction.service';
import Transaction, {
  TransactionStatus,
} from '../../src/transaction/transaction.entity';
import { SignTransactionRequestDto } from 'src/transaction/dto/sign-transaction-request.dto';
import TransactionMock, { DEFAULT } from './transaction.mock';

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
      ],
    }).compile();

    service = testingModule.get<TransactionService>(TransactionService);
    repository = testingModule.get<Repository<Transaction>>(repositoryToken);
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
      jest
        .spyOn(repository, 'create')
        .mockImplementation((transaction) => transaction as Transaction);
      jest
        .spyOn(repository, 'save')
        .mockImplementation((transaction) =>
          Promise.resolve(transaction as Transaction),
        );
      const expected = TransactionMock.txPending0();
      //* 🎬 Act ⬇
      const transaction = await service.create(createTransactionDto);

      //* ☑️ Assert ⬇
      expect(transaction).toBeDefined();
      // expect(transaction.id).toBeDefined();
      expect(transaction.transaction_message).toBe(
        expected.transaction_message,
      );
      expect(transaction.description).toBe(expected.description);
      expect(transaction.status).toBe(expected.status);
      expect(transaction.threshold).toBe(expected.threshold);
      expect(transaction.hedera_account_id).toBe(expected.hedera_account_id);
      expect(transaction.key_list.length).toBe(expected.key_list.length);
      transaction.key_list.forEach((key, i) => {
        expect(key).toBe(expected.key_list[i]);
      });
      expect(transaction.signed_keys.length).toBe(expected.signed_keys.length);
      transaction.signed_keys.forEach((key, i) => {
        expect(key).toBe(expected.signed_keys[i]);
      });
      expect(transaction.signatures.length).toBe(expected.signatures.length);
      transaction.signatures.forEach((signature, i) => {
        expect(signature).toBe(expected.signatures[i]);
      });
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
      jest
        .spyOn(repository, 'create')
        .mockImplementation((transaction) => transaction as Transaction);
      jest
        .spyOn(repository, 'save')
        .mockImplementation((transaction) =>
          Promise.resolve(transaction as Transaction),
        );
      const expected = TransactionMock.txPending0({
        threshold: createTransactionDto.key_list.length,
      });
      //* 🎬 Act ⬇
      const transaction = await service.create(createTransactionDto);

      //* ☑️ Assert ⬇
      expect(transaction).toBeDefined();
      // expect(transaction.id).toBeDefined();
      expect(transaction.transaction_message).toBe(
        expected.transaction_message,
      );
      expect(transaction.description).toBe(expected.description);
      expect(transaction.status).toBe(expected.status);
      expect(transaction.threshold).toBe(expected.threshold);
      expect(transaction.hedera_account_id).toBe(expected.hedera_account_id);
      expect(transaction.key_list.length).toBe(expected.key_list.length);
      transaction.key_list.forEach((key, i) => {
        expect(key).toBe(expected.key_list[i]);
      });
      expect(transaction.signed_keys.length).toBe(expected.signed_keys.length);
      transaction.signed_keys.forEach((key, i) => {
        expect(key).toBe(expected.signed_keys[i]);
      });
      expect(transaction.signatures.length).toBe(expected.signatures.length);
      transaction.signatures.forEach((signature, i) => {
        expect(signature).toBe(expected.signatures[i]);
      });
    });
  });
  describe('Sign transaction', () => {
    it('should sign a transaction in pending and remain in pending', async () => {
      //* 🗂️ Arrange ⬇
      const THRESHOLD = 2;
      // Mock Input
      const signTransactionDto = {
        signed_transaction_message: DEFAULT.txSignedThreshold.signatures[0],
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
      jest
        .spyOn(repository, 'save')
        .mockImplementation((transaction: Transaction) =>
          Promise.resolve(transaction),
        );
      // Mock expected result
      const expected = new TransactionMock({
        id: signTransactionCommand.txId,
        threshold: THRESHOLD,
        status: TransactionStatus.PENDING,
        signed_keys: [signTransactionDto.public_key],
        signatures: [signTransactionDto.signed_transaction_message],
      });

      //* 🎬 Act ⬇
      const transaction = await service.sign(
        signTransactionCommand.body,
        signTransactionCommand.txId,
      );

      //* ☑️ Assert ⬇
      expect(transaction).toBeDefined();
      expected.assert(transaction);
    });
    it('should sign a transaction in pending and change to sign', async () => {
      //* 🗂️ Arrange ⬇
      const THRESHOLD = 2;
      const signTransactionDto = {
        signed_transaction_message: DEFAULT.txSignedThreshold.signatures[1],
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
      jest
        .spyOn(repository, 'save')
        .mockImplementation((transaction: Transaction) =>
          Promise.resolve(transaction),
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
          signTransactionDto.signed_transaction_message,
        ],
      });

      //* 🎬 Act ⬇
      const transaction = await service.sign(
        signTransactionCommand.body,
        signTransactionCommand.txId,
      );

      //* ☑️ Assert ⬇
      expect(transaction).toBeDefined();
      expected.assert(transaction);
    });
  });
});
