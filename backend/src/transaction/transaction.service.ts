import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTransactionRequestDto } from './dto/create-transaction-request.dto';
import Transaction, { TransactionStatus } from './transaction.entity';
import { SignTransactionRequestDto } from './dto/sign-transaction-request.dto';
import { Repository } from 'typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { GetTransactionsResponseDto } from './dto/get-transactions-response.dto';
import { uuidRegex } from '../common/Regexp';

@Injectable()
export default class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async create(
    createTransactionDto: CreateTransactionRequestDto,
  ): Promise<Transaction> {
    const transaction: Transaction = this.transactionRepository.create({
      ...createTransactionDto,
      signed_keys: [],
      status: TransactionStatus.PENDING,
      threshold:
        createTransactionDto.threshold === 0
          ? createTransactionDto.key_list.length
          : createTransactionDto.threshold,
      signed_messages: [],
    });

    await this.transactionRepository.save(transaction);
    return transaction;
  }

  async sign(
    signTransactionDto: SignTransactionRequestDto,
    transactionId: string,
  ): Promise<Transaction> {
    if (!uuidRegex.test(transactionId))
      throw new HttpException('Invalid Transaction uuid format', 400);

    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });
    if (transaction) {
      if (transaction.signed_keys.includes(signTransactionDto.public_key)) {
        throw new HttpException('message already signed', 409);
      }
      if (!transaction.key_list.includes(signTransactionDto.public_key)) {
        throw new HttpException('Unauthorized Key', 401);
      }
      transaction.signed_keys = [
        ...transaction.signed_keys,
        signTransactionDto.public_key,
      ];
      if (transaction.signed_keys.length >= transaction.threshold) {
        transaction.status = TransactionStatus.SIGNED;
      }
      transaction.signed_messages = [
        ...transaction.signed_messages,
        signTransactionDto.signed_transaction_message,
      ];
      await this.transactionRepository.save(transaction);
      return transaction;
    } else {
      throw new HttpException('Transaction not found', 404);
    }
  }

  async delete(transactionId: string): Promise<void> {
    if (!uuidRegex.test(transactionId))
      throw new HttpException('Invalid Transaction uuid format', 400);

    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });
    if (transaction) {
      await this.transactionRepository.delete({ id: transactionId });
    } else {
      throw new HttpException('Transaction not found', 404);
    }
  }

  async getAllByPublicKey(
    publicKey: string,
    type: string,
    options: IPaginationOptions,
  ): Promise<Pagination<GetTransactionsResponseDto>> {
    let queryBuilder;
    if (type == TransactionStatus.SIGNED.toLowerCase()) {
      queryBuilder = this.transactionRepository
        .createQueryBuilder('transaction')
        .where(':publicKey = ANY(transaction.signed_keys)', { publicKey });
    } else if (type == TransactionStatus.PENDING.toLowerCase()) {
      queryBuilder = this.transactionRepository
        .createQueryBuilder('transaction')
        .where(':publicKey = ANY(transaction.key_list)', { publicKey })
        .andWhere('transaction.status = :status', {
          status: TransactionStatus.PENDING,
        });
    } else {
      queryBuilder = this.transactionRepository
        .createQueryBuilder('transaction')
        .where(':publicKey = ANY(transaction.key_list)', { publicKey });
    }

    const paginatedResults = await paginate<Transaction>(queryBuilder, options);

    const itemsTransformed = paginatedResults.items.map(
      (transaction) =>
        new GetTransactionsResponseDto(
          transaction.id,
          transaction.transaction_message,
          transaction.description,
          transaction.status,
          transaction.threshold,
          transaction.key_list,
          transaction.signed_keys,
        ),
    );

    return new Pagination<GetTransactionsResponseDto>(
      itemsTransformed,
      paginatedResults.meta,
      paginatedResults.links,
    );
  }

  async getAll(options: IPaginationOptions): Promise<Pagination<Transaction>> {
    return paginate<Transaction>(this.transactionRepository, options);
  }
}
