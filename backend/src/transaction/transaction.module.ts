import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';

@Module({
  providers: [TransactionService],
  controllers: [TransactionController]
})
export class TransactionModule {}
