import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import TransactionService from '../transaction/transaction.service';

async function deleteAllTransactions() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const transactionsService = app.get(TransactionService);
  await transactionsService.deleteAllTransactions();
  console.log('All transactions has been deleted.');
  await app.close();
}

deleteAllTransactions().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
