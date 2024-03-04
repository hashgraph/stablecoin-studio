import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTransactionRequestDto } from './dto/create-transaction-request.dto';
import { Transaction } from './transaction.entity';

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
    const transaction = this.transactionRepository.create({
      transaction_message: createTransactionDto.transaction_message,
      description: createTransactionDto.description,
      hedera_account_id: createTransactionDto.hedera_account_id,
      key_list: createTransactionDto.key_list,
      remaining_keys: emptyStringArray,
      status: 'PENDING',
      threshold: createTransactionDto.threshold,
    });

    await this.transactionRepository.save(transaction);
    return transaction;
  }
}
