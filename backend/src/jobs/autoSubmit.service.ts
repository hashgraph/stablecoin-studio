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

import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import TransactionService from '../transaction/transaction.service';
import { TransactionStatus } from '../transaction/status.enum';
import {
  Transaction,
  Client,
  PublicKey,
  TransactionResponse,
  TransactionReceipt,
  Status,
} from '@hashgraph/sdk';
import { GetTransactionsResponseDto } from '../transaction/dto/get-transactions-response.dto';
import { hexToUint8Array } from '../utils/utils';
import { LoggerService } from '../logger/logger.service.js';
import LogMessageDTO from '../logger/dto/log-message.dto.js';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export default class AutoSubmitService {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly loggerService: LoggerService,
  ) {}

  @Cron(
    process.env.AUTO_SUBMIT_JOB_FREQUENCY ?? CronExpression.EVERY_30_SECONDS,
  )
  async run() {
    let done = false;
    let page = 1;
    const limit = 100;
    const transactionsToSubmit = [];
    const transactionsToExpire = [];

    this.loggerService.log(
      new LogMessageDTO('', 'Running auto submit job', null),
    );

    do {
      const allTransactions = await this.transactionService.getAll(
        null,
        null,
        null,
        null,
        {
          page,
          limit,
        },
      );

      const currentDate: Date = new Date();
      const currentUTCDate_Minus_3_Minutes = new Date(currentDate.getTime());
      currentUTCDate_Minus_3_Minutes.setSeconds(
        currentUTCDate_Minus_3_Minutes.getSeconds() - 180,
      );

      const submit = allTransactions.items.filter(
        (tx) =>
          tx.status == TransactionStatus.SIGNED &&
          new Date(tx.start_date) <= currentDate &&
          new Date(tx.start_date) > currentUTCDate_Minus_3_Minutes,
      );

      const expire = allTransactions.items.filter(
        (tx) =>
          tx.status != TransactionStatus.EXPIRED &&
          tx.status != TransactionStatus.ERROR &&
          new Date(tx.start_date) <= currentUTCDate_Minus_3_Minutes,
      );

      transactionsToSubmit.push(...submit);
      transactionsToExpire.push(...expire);

      page++;

      if (page >= (await allTransactions.meta.totalPages)) done = true;
    } while (done == false);

    this.loggerService.log(
      new LogMessageDTO(
        '',
        'transactionsToExpire : ' + transactionsToExpire.length,
        null,
      ),
    );

    this.loggerService.log(
      new LogMessageDTO(
        '',
        'transactionsToSubmit : ' + transactionsToSubmit.length,
        null,
      ),
    );

    // EXPIRE TRANSACTIONS
    await transactionsToExpire.forEach(async (t) => {
      await this.transactionService.updateStatus(
        t.id,
        TransactionStatus.EXPIRED,
      );
    });

    // SUBMIT SIGNED TRANSACTIONS TO HEDERA
    await transactionsToSubmit.forEach(async (t) => {
      const success = await this.submit(t);
      if (success) {
        const txId = t.id;
        await this.transactionService.delete(t.id);
        this.loggerService.log(
          new LogMessageDTO('', `Removed transaction Id : ${txId}`, null),
        );
      } else {
        await this.transactionService.updateStatus(
          t.id,
          TransactionStatus.ERROR,
        );
      }
    });
  }

  async submit(transaction: GetTransactionsResponseDto): Promise<boolean> {
    try {
      const client: Client = Client.forName(transaction.network);

      let deserializedTransaction = Transaction.fromBytes(
        hexToUint8Array(transaction.transaction_message),
      );

      for (let i = 0; i < transaction.signatures.length; i++) {
        const publicKey_i = PublicKey.fromString(transaction.signed_keys[i]);
        deserializedTransaction = deserializedTransaction.addSignature(
          publicKey_i,
          hexToUint8Array(transaction.signatures[i]),
        );
      }

      const submitTx = await deserializedTransaction.execute(client);
      this.loggerService.log(
        new LogMessageDTO(
          '',
          `Submitted transaction Id : ${submitTx.transactionId}`,
          null,
        ),
      );

      await this.checkReceipt(submitTx, client);

      this.loggerService.log(
        new LogMessageDTO(
          '',
          `transaction Id : ${submitTx.transactionId} SUCCESS`,
          null,
        ),
      );

      return true;
    } catch (error) {
      this.loggerService.error(
        new LogMessageDTO(
          '',
          `Error submitting the transaction : ${(error as Error).message}`,
          null,
        ),
      );

      return false;
    }
  }

  private async checkReceipt(
    transactionResponse: TransactionResponse,
    client: Client,
  ): Promise<void> {
    const transactionReceipt: TransactionReceipt | undefined =
      await transactionResponse.getReceipt(client);
    if (transactionReceipt.status !== Status.Success) {
      throw new Error(
        `transactions did not succeed. Status : ${transactionReceipt.status}`,
      );
    }
  }
}
