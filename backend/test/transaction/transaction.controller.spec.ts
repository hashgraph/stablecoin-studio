import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
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
    status: TransactionStatus.SIGN,
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
  let transactionController: TransactionController;
  let transactionService: TransactionService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
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

    transactionService = moduleRef.get<TransactionService>(TransactionService);
    transactionController = moduleRef.get<TransactionController>(
      TransactionController,
    );
  });

  describe('Create Transaction', () => {
    it('should create a new transaction', async () => {
      jest
        .spyOn(transactionService, 'create')
        .mockImplementation(() =>
          Promise.resolve(createMockCreateTransactionServiceResult()),
        );

      const expectedResult = createMockAddTransactionControllerResponse();
      const result = await transactionController.addTransaction(
        createMockAddTransactionControllerRequest(),
      );
      expect(result.transactionId).toBe(expectedResult.transactionId);
    });
    it('should create a new transaction with threshold = 0', async () => {
      const mockAddTransactionControllerRequest =
        createMockAddTransactionControllerRequest();
      mockAddTransactionControllerRequest.threshold = 0;
      jest
        .spyOn(transactionService, 'create')
        .mockImplementation(() =>
          Promise.resolve(createMockCreateTransactionServiceResult()),
        );

      const expectedResult = createMockAddTransactionControllerResponse();
      const result = await transactionController.addTransaction(
        mockAddTransactionControllerRequest,
      );
      expect(result.transactionId).toBe(expectedResult.transactionId);
    });
    // TODO: check why it passes the Body validation
    // it('should return 401 or something like that ', async () => {
    //   const addTransactionInput = createAddTransactionInput();
    //   jest.spyOn(transactionService, 'create').mockImplementation(() => {
    //     throw new Error('Should not get here');
    //   });

    //   const result =
    //     await transactionController.addTransaction(addTransactionInput);
    //   console.log(result);
    // });
  });

  describe('Sign Transaction', () => {
    it('should sign a transaction', async () => {
      const mockSignTransactionControllerRequest =
        createMockSignTransactionControllerRequest();
      jest
        .spyOn(transactionService, 'sign')
        .mockImplementation(() =>
          Promise.resolve(createMockSignTransactionServiceResult()),
        );

      await transactionController.signTransaction(
        mockSignTransactionControllerRequest.transaction_id,
        mockSignTransactionControllerRequest.signedTransation,
      );
    });
  });

  describe('Delete Transaction', () => {
    it('should delete a transaction', async () => {
      const transaction_id = DEFAULT.transaction.id;
      jest
        .spyOn(transactionService, 'delete')
        .mockImplementation(() => Promise.resolve());

      await transactionController.deleteTransaction(transaction_id);
    });
  });

  describe('Get Transactions', () => {
    it('should get transactions linked to a public key', async () => {
      jest
        .spyOn(transactionService, 'getAll')
        .mockImplementation(() =>
          Promise.resolve(createMockGetAllTransactionServiceResult()),
        );

      // Same as service result
      const expectedResult = createMockGetTransactionsControllerResponse();
      const result = await transactionController.getTransactions(
        createMockGetTransactionsControllerRequest(),
      );
      expect(result.length).toEqual(expectedResult.length);
      result.forEach((transaction, index) => {
        expect(transaction).toEqual(expectedResult[index]);
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
  transaction.status = TransactionStatus.SIGN;
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

function createMockGetAllTransactionServiceResult(): GetTransactionsResponseDto[] {
  const transactionResponse = new GetTransactionsResponseDto(
    DEFAULT.transaction.id,
    DEFAULT.transaction.message,
    DEFAULT.transaction.description,
    DEFAULT.transaction.status,
    DEFAULT.transaction.threshold,
    DEFAULT.transaction.key_list,
    DEFAULT.transaction.signed_keys,
  );
  return [transactionResponse, transactionResponse];
}

function createMockGetTransactionsControllerRequest(): string {
  const publicKey = DEFAULT.transaction.key_list[0];
  return publicKey;
}

function createMockGetTransactionsControllerResponse(): GetTransactionsResponseDto[] {
  return createMockGetAllTransactionServiceResult();
}
