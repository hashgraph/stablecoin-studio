import { Module } from '@nestjs/common';
import AutoSubmitService from './autoSubmit.service';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [TransactionModule],
  providers: [AutoSubmitService],
})
export class JobsModule {}
