import { Injectable, LoggerService } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import TransactionService from '../transaction/transaction.service.js';
import { TransactionStatus } from '../transaction/status.enum.js';
import { Transaction, Client, PublicKey } from '@hashgraph/sdk';
import { GetTransactionsResponseDto } from '../transaction/dto/get-transactions-response.dto.js';
import { hexToUint8Array } from '../utils/utils.js';

@Injectable()
export default class AutoSubmitJob {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly loggerService: LoggerService,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async run() {
    let done = false;
    let page = 0;
    const limit = 100;
    const transactionsToSubmit = [];

    this.loggerService.log('Running auto submit job');

    do {
      const signedTransactions = await this.transactionService.getAll(
        null,
        TransactionStatus.SIGNED,
        null,
        null,
        {
          page,
          limit,
        },
      );

      const currentDate: Date = new Date();
      const currentUTCDate = new Date(
        currentDate.getTime() + currentDate.getTimezoneOffset() * 60000,
      );
      const currentUTCDate_Plus3Minutes = new Date(currentUTCDate.getTime());
      currentUTCDate_Plus3Minutes.setSeconds(
        currentUTCDate_Plus3Minutes.getSeconds() + 180,
      );

      const startDateTrasnactions = signedTransactions.items.filter(
        (tx) =>
          new Date(tx.start_date) >= currentUTCDate &&
          new Date(tx.start_date) < currentUTCDate_Plus3Minutes,
      );

      transactionsToSubmit.push(...startDateTrasnactions);

      page++;

      if (page == (await signedTransactions.meta.totalPages)) done = true;
    } while (done == false);

    // SUBMIT SIGNED TRANSACTIONS TO HEDERA
    await transactionsToSubmit.forEach(async (t) => {
      await this.submit(t);
      await this.transactionService.delete(t.id);
      this.loggerService.log(`Removed transaction Id : ${t.transactionId}`);
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
        `Submitted transaction Id : ${submitTx.transactionId}`,
      );

      return true;
    } catch (error) {
      this.loggerService.error(
        `Error submitting the transaction : ${(error as Error).message}`,
      );

      return false;
    }
  }
}
