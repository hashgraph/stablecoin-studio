import { Command } from '../../decorators/Command.js';
import { BaseCommandHandler } from '../BaseCommandHandler.js';
import { AmountParams, AmountResult } from '../types.js';
import { ContractFunctionParameters, Long } from '@hiero-ledger/sdk';

@Command('updateReserveAmount')
export class UpdateReserveAmountHandler extends BaseCommandHandler<AmountParams, AmountResult> {
  constructor() {
    super('updateReserveAmount', ['function updateReserveAmount(uint256 amount)'], 80_000);
  }

  protected mapParamsToArgs(params: AmountParams): unknown[] {
    return [BigInt(params.amount)];
  }

  protected buildHederaFunctionParams(params: AmountParams): ContractFunctionParameters {
    return new ContractFunctionParameters().addUint256(Long.fromString(params.amount));
  }

  protected validateParams(params: AmountParams): void {
    if (BigInt(params.amount) < 0n) throw new Error('Amount must be non-negative');
  }

  protected createResult(receipt: any, params: AmountParams): AmountResult {
    return {
      success: true,
      transactionId: receipt?.transactionId?.toString() ?? '',
      amount: params.amount,
    };
  }
}
