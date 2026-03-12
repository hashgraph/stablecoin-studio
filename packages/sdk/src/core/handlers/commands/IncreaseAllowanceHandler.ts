import { Command } from '../../decorators/Command.js';
import { BaseCommandHandler } from '../BaseCommandHandler.js';
import { TargetAmountParams, TargetAmountResult } from '../types.js';
import { ContractFunctionParameters, Long } from '@hiero-ledger/sdk';

@Command('increaseAllowance')
export class IncreaseAllowanceHandler extends BaseCommandHandler<TargetAmountParams, TargetAmountResult> {
  constructor() {
    super('increaseSupplierAllowance', ['function increaseSupplierAllowance(address account, uint256 amount)'], 80_000);
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
