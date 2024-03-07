import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTransactionRequestDto } from '../../src/transaction/dto/create-transaction-request.dto';
import TransactionController from '../../src/transaction/transaction.controller';
import { Transaction } from '../../src/transaction/transaction.entity';
import TransactionService from '../../src/transaction/transaction.service';
import { CreateTransactionResponseDto } from '../../src/transaction/dto/create-transaction-response.dto';

describe('Transaction Controller Test', () => {
  let transactionController: TransactionController;
  let transactionService: TransactionService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        TransactionService,
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
      const addTransactionInput = createAddTransactionInput();
      const createTransactionServiceResult = createMockTransaction();
      jest
        .spyOn(transactionService, 'create')
        .mockImplementation(() =>
          Promise.resolve(createTransactionServiceResult),
        );

      const expectedResult = new CreateTransactionResponseDto(
        createTransactionServiceResult.id,
      );
      const result = await transactionController.addTransaction(addTransactionInput);
      expect(result.transactionId).toBe(expectedResult.transactionId);
    });
  });
});

/**
 * Creates a sample `CreateTransactionRequestDto` object for testing purposes.
 * @returns The created `CreateTransactionRequestDto` object.
 */
function createAddTransactionInput(): CreateTransactionRequestDto {
  const createTransactionRequestDto: CreateTransactionRequestDto = {
    transaction_message:
      '0a81012a7f0a7b0a1a0a0b08e8eea5af0610defbe66e12090800100018ddd6a20118001206080010001803188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a474770611080cab5ee0130ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda0388010012000a81012a7f0a7b0a1a0a0b08e8eea5af0610defbe66e12090800100018ddd6a20118001206080010001807188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a474770611080cab5ee0130ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda0388010012000a81012a7f0a7b0a1a0a0b08e8eea5af0610defbe66e12090800100018ddd6a20118001206080010001803188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a474770611080cab5ee0130ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda0388010012000a81012a7f0a7b0a1a0a0b08e8eea5af0610defbe66e12090800100018ddd6a20118001206080010001809188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a474770611080cab5ee0130ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda0388010012000a81012a7f0a7b0a1a0a0b08e8eea5af0610defbe66e12090800100018ddd6a20118001206080010001804188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a474770611080cab5ee0130ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda038801001200',
    description: 'This transaction is for the creation of a new StableCoin',
    hedera_account_id: '0.0.123456',
    key_list: [
      '75ec8c1997089874ce881690e95900f821a7f69152814728be971e67e4bc2224',
      '4617e0079f0e943fc407e77ca9fc366f47ccdb4cbec6d5d51eeb996e781c052d',
      'a0d7a883021253dc9f260ca7934b352f2d75e96d23ebdd1b3851ec0f0f0729d1',
    ],
    threshold: 2,
  };

  return createTransactionRequestDto;
}

/**
 * Creates a mock transaction object for testing purposes.
 * @returns {Transaction} The mock transaction object.
 */
function createMockTransaction(): Transaction {
  const transaction = new Transaction();
  transaction.id = '0.0.2665309'; // ID for the transaction
  transaction.transaction_message =
    '0a81012a7f0a7b0a1a0a0b08e8eea5af0610defbe66e12090800100018ddd6a20118001206080010001803188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a474770611080cab5ee0130ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda0388010012000a81012a7f0a7b0a1a0a0b08e8eea5af0610defbe66e12090800100018ddd6a20118001206080010001807188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a474770611080cab5ee0130ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda0388010012000a81012a7f0a7b0a1a0a0b08e8eea5af0610defbe66e12090800100018ddd6a20118001206080010001803188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a474770611080cab5ee0130ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda0388010012000a81012a7f0a7b0a1a0a0b08e8eea5af0610defbe66e12090800100018ddd6a20118001206080010001809188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a474770611080cab5ee0130ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda0388010012000a81012a7f0a7b0a1a0a0b08e8eea5af0610defbe66e12090800100018ddd6a20118001206080010001804188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a474770611080cab5ee0130ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda038801001200';
  transaction.description =
    'This transaction is for the creation of a new StableCoin';
  transaction.hedera_account_id = '0.0.123456';
  transaction.signed_messages = [
    '0ae9012ae6010a7c0a1b0a0c08f6eca5af0610ea98a1ad0112090800100018ddd6a20118001206080010001806188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d',
    '0ae9012ae6010a7c0a1b0a0c08f6eca5af0610ea98a1ad0112090800100018ddd6a20118001206080010001806188084af5f2202087832005a4a0a22122094ac3f274e59cb947c4685d16cfa2d8a5d',
  ];
  transaction.key_list = [
    '75ec8c1997089874ce881690e95900f821a7f69152814728be971e67e4bc2224',
    '4617e0079f0e943fc407e77ca9fc366f47ccdb4cbec6d5d51eeb996e781c052d',
    'a0d7a883021253dc9f260ca7934b352f2d75e96d23ebdd1b3851ec0f0f0729d1',
  ];
  transaction.signed_keys = [
    '75ec8c1997089874ce881690e95900f821a7f69152814728be971e67e4bc2224',
    '4617e0079f0e943fc407e77ca9fc366f47ccdb4cbec6d5d51eeb996e781c052d',
  ];
  transaction.status = 'SIGNED'; // or 'PENDING' depending on the test case
  transaction.threshold = 2;

  return transaction;
}
