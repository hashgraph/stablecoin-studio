import { Command } from '../../decorators/Command.js';
import { BaseCommandHandler } from '../BaseCommandHandler.js';
import { CommandParams, TransactionResult } from '../types.js';
import { ContractFunctionParameters, Long } from '@hiero-ledger/sdk';

export interface ExecuteHoldParams extends CommandParams {
  holdId: string;
  amount: string;
}

@Command('executeHold')
export class ExecuteHoldHandler extends BaseCommandHandler<ExecuteHoldParams, TransactionResult> {
  constructor() {
    super('executeHold', ['function executeHold(bytes32 holdId, uint256 amount)'], 120_000);
  }

  protected mapParamsToArgs(params: ExecuteHoldParams): unknown[] {
    return [params.holdId, BigInt(params.amount)];
  }

  protected buildHederaFunctionParams(params: ExecuteHoldParams): ContractFunctionParameters {
    const holdIdBytes = Buffer.from(params.holdId.replace('0x', ''), 'hex');
    return new ContractFunctionParameters()
      .addBytes32(holdIdBytes)
      .addUint256(Long.fromString(params.amount));
  }

  protected validateParams(params: ExecuteHoldParams): void {
    if (!params.holdId) throw new Error('Hold ID required');
    if (BigInt(params.amount) <= 0n) throw new Error('Amount must be positive');
  }

  protected createResult(receipt: any): TransactionResult {
    return {
      success: true,
      transactionId: receipt?.transactionId?.toString() ?? '',
    };
  }
}
