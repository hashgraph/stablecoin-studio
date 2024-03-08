import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import TransactionService from '../../src/transaction/transaction.service';
import Transaction, {
  TransactionStatus,
} from '../../src/transaction/transaction.entity';

const DEFAULT = {
  transaction: {
    id: '0.0.2665309',
    message:
      '0a81012a7f0a7b0a1a0a0b08e8eea5af0610defbe66e12090800100018ddd6a20118001206080010001803188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a474770611080cab5ee0130ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda0388010012000a81012a7f0a7b0a1a0a0b08e8eea5af0610defbe66e12090800100018ddd6a20118001206080010001807188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a474770611080cab5ee0130ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda0388010012000a81012a7f0a7b0a1a0a0b08e8eea5af0610defbe66e12090800100018ddd6a20118001206080010001803188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a474770611080cab5ee0130ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda0388010012000a81012a7f0a7b0a1a0a0b08e8eea5af0610defbe66e12090800100018ddd6a20118001206080010001809188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a474770611080cab5ee0130ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda0388010012000a81012a7f0a7b0a1a0a0b08e8eea5af0610defbe66e12090800100018ddd6a20118001206080010001804188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a474770611080cab5ee0130ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda038801001200',
    description: 'This transaction is for the creation of a new StableCoin',
    status: TransactionStatus.SIGNED,
    threshold: 2,
    hedera_account_id: '0.0.123456',
    key_list: [
      '75ec8c1997089874ce881690e95900f821a7f69152814728be971e67e4bc2224',
      '4617e0079f0e943fc407e77ca9fc366f47ccdb4cbec6d5d51eeb996e781c052d',
      'a0d7a883021253dc9f260ca7934b352f2d75e96d23ebdd1b3851ec0f0f0729d1',
    ],
    signed_keys: [
      '75ec8c1997089874ce881690e95900f821a7f69152814728be971e67e4bc2224',
      '4617e0079f0e943fc407e77ca9fc366f47ccdb4cbec6d5d51eeb996e781c052d',
    ],
    signed_messages: [
      '0a81012a7f0a7b0a1a0a0b08e8eea5af0610defbe66e12090800100018ddd6a20118001206080010001803188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a474770611080cab5ee0130ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda038801001200',
      '0a81012a7f0a7b0a1a0a0b08e8eea5af0610defbe66e12090800100018ddd6a20118001206080010001807188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a474770611080cab5ee0130ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda038801001200',
    ],
  },
};

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
  });
  describe('Create transaction', () => {
    it('should create a transaction', async () => {
      // Arrange
      const createTransactionDto = {
        transaction_message: DEFAULT.transaction.message,
        description: DEFAULT.transaction.description,
        hedera_account_id: DEFAULT.transaction.hedera_account_id,
        key_list: DEFAULT.transaction.key_list,
        threshold: DEFAULT.transaction.threshold,
      };
      jest.spyOn(repository, 'create').mockImplementation(() =>
        createMockCreateTxRepositoryResult({
          entityLike: createTransactionDto,
        }),
      );
      jest
        .spyOn(repository, 'save')
        .mockImplementation(() =>
          Promise.resolve(repository.create(createTransactionDto)),
        );

      // Act
      const transaction = await service.create(createTransactionDto);

      // Assert
      expect(transaction).toBeDefined();
      expect(transaction.id).toBeDefined();
      expect(transaction.transaction_message).toEqual(
        createTransactionDto.transaction_message,
      );
      expect(transaction.description).toEqual(createTransactionDto.description);
      expect(transaction.status).toEqual(TransactionStatus.PENDING);
      expect(transaction.threshold).toEqual(createTransactionDto.threshold);
      expect(transaction.hedera_account_id).toEqual(
        createTransactionDto.hedera_account_id,
      );
      transaction.key_list.forEach((key, index) => {
        expect(key).toEqual(createTransactionDto.key_list[index]);
      });
      expect(transaction.signed_keys.length).toEqual(0);
      transaction.signed_keys.forEach((key) => {
        expect(key).toBeUndefined();
      });
      expect(transaction.signed_messages.length).toEqual(0);
      transaction.signed_messages.forEach((message) => {
        expect(message).toBeUndefined();
      });
    });
    it('should create a transaction with threshold equal to 0', async () => {
      // Arrange
      const createTransactionDto = {
        transaction_message: DEFAULT.transaction.message,
        description: DEFAULT.transaction.description,
        hedera_account_id: DEFAULT.transaction.hedera_account_id,
        key_list: DEFAULT.transaction.key_list,
        threshold: 0,
      };
      jest.spyOn(repository, 'create').mockImplementation(() =>
        createMockCreateTxRepositoryResult({
          entityLike: createTransactionDto,
        }),
      );
      jest
        .spyOn(repository, 'save')
        .mockImplementation(() =>
          Promise.resolve(repository.create(createTransactionDto)),
        );

      // Act
      const transaction = await service.create(createTransactionDto);

      // Assert
      expect(transaction).toBeDefined();
      expect(transaction.id).toBeDefined();
      expect(transaction.transaction_message).toEqual(
        createTransactionDto.transaction_message,
      );
      expect(transaction.description).toEqual(createTransactionDto.description);
      expect(transaction.status).toEqual(TransactionStatus.PENDING);
      expect(transaction.threshold).toEqual(createTransactionDto.threshold);
      expect(transaction.hedera_account_id).toEqual(
        createTransactionDto.hedera_account_id,
      );
      transaction.key_list.forEach((key, index) => {
        expect(key).toEqual(createTransactionDto.key_list[index]);
      });
      expect(transaction.signed_keys.length).toEqual(0);
      transaction.signed_keys.forEach((key) => {
        expect(key).toBeUndefined();
      });
      expect(transaction.signed_messages.length).toEqual(0);
      transaction.signed_messages.forEach((message) => {
        expect(message).toBeUndefined();
      });
    });
  });
});

function createMockCreateTxRepositoryResult({
  entityLike,
}: {
  entityLike: DeepPartial<Transaction>;
}): Transaction {
  const transaction = new Transaction();
  transaction.id = DEFAULT.transaction.id;
  transaction.transaction_message = entityLike.transaction_message;
  transaction.description = entityLike.description;
  transaction.status = TransactionStatus.PENDING;
  transaction.threshold = entityLike.threshold;
  transaction.hedera_account_id = entityLike.hedera_account_id;
  transaction.key_list = entityLike.key_list;
  transaction.signed_keys = [];
  transaction.signed_messages = [];
  return transaction;
}
