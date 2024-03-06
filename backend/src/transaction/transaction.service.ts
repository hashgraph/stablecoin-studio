import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTransactionRequestDto } from './dto/create-transaction-request.dto';
import { Transaction } from './transaction.entity';
import { SignTransactionRequestDto } from './dto/sign-transaction-request.dto';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async create(
    createTransactionDto: CreateTransactionRequestDto,
  ): Promise<Transaction> {
    const emptyStringArray: string[] = [];
    const transaction: Transaction = this.transactionRepository.create({
      transaction_message: createTransactionDto.transaction_message,
      description: createTransactionDto.description,
      hedera_account_id: createTransactionDto.hedera_account_id,
      key_list: createTransactionDto.key_list,
      signed_keys: emptyStringArray,
      status: 'PENDING',
      threshold: createTransactionDto.threshold,
      signed_messages: emptyStringArray,
    });

    await this.transactionRepository.save(transaction);
    return transaction;
  }

  async sign(
    signTransactionDto: SignTransactionRequestDto,
    transactionId: string,
  ): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });
    if (transaction) {
      if (transaction.signed_keys.includes(signTransactionDto.public_key)) {
        throw new Error('message already signed');
      }
      if (!transaction.key_list.includes(signTransactionDto.public_key)) {
        throw new Error('Key not found');
      }
      transaction.signed_keys = [
        ...transaction.signed_keys,
        signTransactionDto.public_key,
      ];
      if (transaction.signed_keys.length >= transaction.threshold) {
        transaction.status = 'SIGNED';
      }
      transaction.signed_messages = [
        ...transaction.signed_messages,
        signTransactionDto.signed_transaction_message,
      ];
      await this.transactionRepository.save(transaction);
      return transaction;
    } else {
      throw new Error('Transaction not found');
    }
  }

  async delete(transactionId: string): Promise<void> {
    await this.transactionRepository.delete({ id: transactionId });
  }

  async getAll(): Promise<Transaction[]> {
    return await this.transactionRepository.find();
  }
}
