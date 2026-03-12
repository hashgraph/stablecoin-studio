import { Command } from '../../decorators/Command.js';
import { BaseCommandHandler } from '../BaseCommandHandler.js';
import { TransferParams, TransferResult } from '../types.js';
import { ContractFunctionParameters, Long } from '@hiero-ledger/sdk';

@Command('transfer')
export class TransferHandler extends BaseCommandHandler<TransferParams, TransferResult> {
  constructor() {
    super('transfer', ['function transfer(address from, address to, uint256 amount)'], 120_000);
  }

  protected mapParamsToArgs(params: TransferParams): unknown[] {
    return [params.fromId, params.targetId, BigInt(params.amount)];
  }

  protected buildHederaFunctionParams(params: TransferParams): ContractFunctionParameters {
    return new ContractFunctionParameters()
      .addAddress(params.fromId)
      .addAddress(params.targetId)
      .addUint256(Long.fromString(params.amount));
  }

  protected validateParams(params: TransferParams): void {
    if (!params.fromId) throw new Error('From account required');
    if (!params.targetId) throw new Error('Target account required');
    if (BigInt(params.amount) <= 0n) throw new Error('Amount must be positive');
  }

  protected createResult(receipt: any, params: TransferParams): TransferResult {
    return {
      success: true,
      transactionId: receipt?.transactionId?.toString() ?? '',
      fromId: params.fromId,
      targetId: params.targetId,
      amount: params.amount,
    };
  }
}
