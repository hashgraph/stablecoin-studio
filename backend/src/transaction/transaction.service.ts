/*
 *
 * Hedera Stablecoin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTransactionRequestDto } from './dto/create-transaction-request.dto';
import Transaction from './transaction.entity';
import { SignTransactionRequestDto } from './dto/sign-transaction-request.dto';
import { Repository } from 'typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { GetTransactionsResponseDto } from './dto/get-transactions-response.dto';
import { uuidRegex } from '../common/regexp';
import { removeDuplicates, verifySignature } from '../utils/utils';
import {
  InvalidSignatureException,
  MessageAlreadySignedException,
  TransactionNotFoundException,
  UnauthorizedKeyException,
} from '../common/exceptions/domain-exceptions';
import { TransactionStatus } from './status.enum';
import { Network } from './network.enum';

@Injectable()
export default class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async create(
    createTransactionDto: CreateTransactionRequestDto,
  ): Promise<Transaction> {
    createTransactionDto.key_list = removeDuplicates(
      createTransactionDto.key_list,
    );

    const transaction: Transaction = this.transactionRepository.create({
      ...createTransactionDto,
      signed_keys: [],
      status: TransactionStatus.PENDING,
      threshold:
        createTransactionDto.threshold === 0 ||
        createTransactionDto.threshold > createTransactionDto.key_list.length
          ? createTransactionDto.key_list.length
          : createTransactionDto.threshold,
      signatures: [],
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
    if (!transaction)
      throw new TransactionNotFoundException('Transaction not found');

    if (transaction.signed_keys.includes(signTransactionDto.public_key))
      throw new MessageAlreadySignedException('Message already signed');

    if (!transaction.key_list.includes(signTransactionDto.public_key))
      throw new UnauthorizedKeyException('Unauthorized Key');

    if (
      !verifySignature(
        signTransactionDto.public_key,
        transaction.transaction_message,
        signTransactionDto.signature,
      )
    )
      throw new InvalidSignatureException('Invalid signature');

    transaction.signed_keys = [
      ...transaction.signed_keys,
      signTransactionDto.public_key,
    ];
    transaction.signatures = [
      ...transaction.signatures,
      signTransactionDto.signature,
    ];
    // Update transaction status to 'SIGNED' if the number of signed keys meets or exceeds the threshold
    if (transaction.signed_keys.length >= transaction.threshold) {
      transaction.status = TransactionStatus.SIGNED;
    }
    await this.transactionRepository.save(transaction);
    return transaction;
  }

  async delete(transactionId: string): Promise<void> {
    if (!uuidRegex.test(transactionId))
      throw new TransactionNotFoundException('Transaction not found');

    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });
    if (transaction) {
      await this.transactionRepository.delete({ id: transactionId });
    } else {
      throw new TransactionNotFoundException('Transaction not found');
    }
  }

  async getAll(
    publicKey?: string,
    status?: string,
    network?: string,
    options?: IPaginationOptions,
  ): Promise<Pagination<GetTransactionsResponseDto>> {
    let queryBuilder =
      this.transactionRepository.createQueryBuilder('transaction');
    //TODO: move this to the controller
    const normalizedNetwork = network?.toLowerCase();
    if (
      normalizedNetwork &&
      !Object.values(Network)
        .map((value) => value.toLowerCase())
        .includes(normalizedNetwork)
    ) {
      throw new Error(
        `Invalid network: ${network}. Valid values are: ${Object.values(Network).join(', ')}`,
      );
    }
    const normalizedStatus = status?.toUpperCase();
    if (normalizedStatus && !(normalizedStatus in TransactionStatus)) {
      throw new Error(
        `Invalid status: ${status}. Valid values are: ${Object.values(TransactionStatus).join(', ')}`,
      );
    }
    //---
    if (publicKey) {
      queryBuilder = queryBuilder.where(
        ':publicKey = ANY(transaction.key_list)',
        { publicKey },
      );
    }
    if (normalizedStatus) {
      queryBuilder = queryBuilder.andWhere('transaction.status = :status', {
        status: normalizedStatus,
      });
    }
    if (normalizedNetwork) {
      queryBuilder = queryBuilder.andWhere('transaction.network = :network', {
        network: normalizedNetwork,
      });
    }

    const paginatedResults = await paginate<Transaction>(queryBuilder, options);

    const itemsTransformed = paginatedResults.items.map((transaction) =>
      this.transformToDto(transaction),
    );

    return new Pagination<GetTransactionsResponseDto>(
      itemsTransformed,
      paginatedResults.meta,
      paginatedResults.links,
    );
  }

  async getById(transactionId: string): Promise<GetTransactionsResponseDto> {
    if (!uuidRegex.test(transactionId))
      throw new TransactionNotFoundException('Transaction not found');

    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });
    if (transaction) {
      return this.transformToDto(transaction);
    } else {
      throw new TransactionNotFoundException('Transaction not found');
    }
  }

  //This function is used to delete all transactions from the database
  async deleteAllTransactions(): Promise<void> {
    await this.transactionRepository.clear();
  }

  private transformToDto(transaction: Transaction): GetTransactionsResponseDto {
    return new GetTransactionsResponseDto(
      transaction.id,
      transaction.transaction_message,
      transaction.description,
      transaction.status,
      transaction.threshold,
      transaction.key_list,
      transaction.signed_keys,
      transaction.signatures,
      transaction.network,
    );
  }
}
