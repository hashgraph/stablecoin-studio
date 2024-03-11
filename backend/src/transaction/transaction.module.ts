import { Module } from '@nestjs/common';
import TransactionService from './transaction.service';
import TransactionController from './transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Transaction from './transaction.entity';
import { LoggerService } from '../logger/logger.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  providers: [TransactionService, LoggerService],
  controllers: [TransactionController],
})
export class TransactionModule {}
