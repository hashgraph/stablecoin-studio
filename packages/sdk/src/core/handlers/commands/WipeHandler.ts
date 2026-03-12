import { Command } from '../../decorators/Command.js';
import { BaseCommandHandler } from '../BaseCommandHandler.js';
import { TargetAmountParams, TargetAmountResult } from '../types.js';
import { ContractFunctionParameters, Long } from '@hiero-ledger/sdk';

@Command('wipe')
export class WipeHandler extends BaseCommandHandler<TargetAmountParams, TargetAmountResult> {
  constructor() {
    super('wipe', ['function wipe(address account, uint256 amount)'], 100_000);
  }

  protected mapParamsToArgs(params: TargetAmountParams): unknown[] {
    return [params.targetId, BigInt(params.amount)];
  }

  protected buildHederaFunctionParams(params: TargetAmountParams): ContractFunctionParameters {
    return new ContractFunctionParameters()
      .addAddress(params.targetId)
      .addUint256(Long.fromString(params.amount));
  }

  protected validateParams(params: TargetAmountParams): void {
    if (!params.targetId) throw new Error('Target account required');
    if (BigInt(params.amount) <= 0n) throw new Error('Amount must be positive');
  }

  protected createResult(receipt: any, params: TargetAmountParams): TargetAmountResult {
    return {
      success: true,
      transactionId: receipt?.transactionId?.toString() ?? '',
      targetId: params.targetId,
      amount: params.amount,
    };
  }
}
