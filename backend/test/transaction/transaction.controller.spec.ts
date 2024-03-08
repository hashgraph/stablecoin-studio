import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pagination, IPaginationMeta } from 'nestjs-typeorm-paginate';
import { CreateTransactionRequestDto } from '../../src/transaction/dto/create-transaction-request.dto';
import TransactionController from '../../src/transaction/transaction.controller';
import Transaction, {
  TransactionStatus,
} from '../../src/transaction/transaction.entity';
import TransactionService from '../../src/transaction/transaction.service';
import { CreateTransactionResponseDto } from '../../src/transaction/dto/create-transaction-response.dto';
import { SignTransactionRequestDto } from '../../src/transaction/dto/sign-transaction-request.dto';
import { GetTransactionsResponseDto } from '../../src/transaction/dto/get-transactions-response.dto';

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
      ],
    }).compile();

    service = testingModule.get<TransactionService>(TransactionService);
    controller = testingModule.get<TransactionController>(
      TransactionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Create transaction', () => {
    it('should create a new transaction', async () => {
      jest
        .spyOn(service, 'create')
        .mockImplementation(() =>
          Promise.resolve(createMockCreateTransactionServiceResult()),
        );

      const expectedResult = createMockAddTransactionControllerResponse();
      const result = await controller.addTransaction(
        createMockAddTransactionControllerRequest(),
      );
      expect(result.transactionId).toBe(expectedResult.transactionId);
    });
    it('should create a new transaction with threshold = 0', async () => {
      const mockAddTransactionControllerRequest =
        createMockAddTransactionControllerRequest();
      mockAddTransactionControllerRequest.threshold = 0;
      jest
        .spyOn(service, 'create')
        .mockImplementation(() =>
          Promise.resolve(createMockCreateTransactionServiceResult()),
        );

      const expectedResult = createMockAddTransactionControllerResponse();
      const result = await controller.addTransaction(
        mockAddTransactionControllerRequest,
      );
      expect(result.transactionId).toBe(expectedResult.transactionId);
    });
  });

  describe('Sign Transaction', () => {
    it('should sign a transaction', async () => {
      const mockSignTransactionControllerRequest =
        createMockSignTransactionControllerRequest();
      jest
        .spyOn(service, 'sign')
        .mockImplementation(() =>
          Promise.resolve(createMockSignTransactionServiceResult()),
        );

      await controller.signTransaction(
        mockSignTransactionControllerRequest.transaction_id,
        mockSignTransactionControllerRequest.signedTransation,
      );
    });
  });

  describe('Delete Transaction', () => {
    it('should delete a transaction', async () => {
      const transaction_id = DEFAULT.transaction.id;
      jest.spyOn(service, 'delete').mockImplementation(() => Promise.resolve());

      await controller.deleteTransaction(transaction_id);
    });
  });

  describe('Get Transactions', () => {
    it('should get all transactions linked to a public key', async () => {
      const publicKey = DEFAULT.transaction.key_list[0];
      jest
        .spyOn(service, 'getAllByPublicKey')
        .mockImplementation(() =>
          Promise.resolve(
            createMockGetAllByPublicKeyTxServiceResult(publicKey),
          ),
        );

      // Same as service result
      const expectedResult = await service.getAllByPublicKey(publicKey);
      const result = await controller.getByPublicKey(publicKey);
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
});

//* Helper Functions
//* Create Mocks

function createMockCreateTransactionServiceResult(): Transaction {
  const transaction = new Transaction();
  transaction.id = DEFAULT.transaction.id;
  transaction.transaction_message = DEFAULT.transaction.message;
  transaction.description = DEFAULT.transaction.description;
  transaction.hedera_account_id = DEFAULT.transaction.hedera_account_id;
  transaction.signed_messages = DEFAULT.transaction.signed_messages;
  transaction.key_list = DEFAULT.transaction.key_list;
  transaction.signed_keys = DEFAULT.transaction.signed_keys;
  transaction.status = DEFAULT.transaction.status;
  transaction.threshold = DEFAULT.transaction.threshold;

  return transaction;
}

function createMockAddTransactionControllerRequest(): CreateTransactionRequestDto {
  const createTransactionRequestDto: CreateTransactionRequestDto = {
    transaction_message: DEFAULT.transaction.message,
    description: DEFAULT.transaction.description,
    hedera_account_id: DEFAULT.transaction.hedera_account_id,
    key_list: DEFAULT.transaction.key_list,
    threshold: DEFAULT.transaction.threshold,
  };

  return createTransactionRequestDto;
}

function createMockAddTransactionControllerResponse(): CreateTransactionResponseDto {
  const createTransactionServiceResult =
    createMockCreateTransactionServiceResult();
  return new CreateTransactionResponseDto(createTransactionServiceResult.id);
}

//* Sign Mocks

function createMockSignTransactionServiceResult(): Transaction {
  const transaction = new Transaction();
  transaction.id = DEFAULT.transaction.id;
  transaction.transaction_message = DEFAULT.transaction.message;
  transaction.description = DEFAULT.transaction.description;
  transaction.hedera_account_id = DEFAULT.transaction.hedera_account_id;
  transaction.signed_messages = DEFAULT.transaction.signed_messages;
  transaction.key_list = DEFAULT.transaction.key_list;
  transaction.signed_keys = DEFAULT.transaction.signed_keys;
  transaction.status = TransactionStatus.SIGNED;
  transaction.threshold = DEFAULT.transaction.threshold;

  return transaction;
}

function createMockSignTransactionControllerRequest() {
  return {
    transaction_id: DEFAULT.transaction.id,
    signedTransation: {
      signed_transaction_message: DEFAULT.transaction.signed_messages[0],
      public_key: DEFAULT.transaction.key_list[0],
    } as SignTransactionRequestDto,
  };
}

//* Get Mocks

function createMockGetAllByPublicKeyTxServiceResult(
  publicKey: string,
  options?: { page?: number; limit?: number },
): Pagination<GetTransactionsResponseDto, IPaginationMeta> {
  const transactionResponse = new GetTransactionsResponseDto(
    DEFAULT.transaction.id,
    DEFAULT.transaction.message,
    DEFAULT.transaction.description,
    DEFAULT.transaction.status,
    DEFAULT.transaction.threshold,
    [
      publicKey,
      DEFAULT.transaction.key_list[1],
      DEFAULT.transaction.key_list[2],
    ],
    DEFAULT.transaction.signed_keys,
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
