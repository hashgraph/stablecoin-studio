import { Command } from '../../decorators/Command.js';
import { BaseCommandHandler } from '../BaseCommandHandler.js';
import { HoldIdParams, TransactionResult, ensureBytes32 } from '../types.js';
import { ContractFunctionParameters } from '@hiero-ledger/sdk';

@Command('releaseHold')
export class ReleaseHoldHandler extends BaseCommandHandler<HoldIdParams, TransactionResult> {
  constructor() {
    super('releaseHold', ['function releaseHold(bytes32 holdId)'], 80_000);
  }

  protected mapParamsToArgs(params: HoldIdParams): unknown[] {
    return [params.holdId];
  }

  protected buildHederaFunctionParams(params: HoldIdParams): ContractFunctionParameters {
    return new ContractFunctionParameters().addBytes32(ensureBytes32(params.holdId));
  }

  protected validateParams(params: HoldIdParams): void {
    if (!params.holdId) throw new Error('Hold ID required');
  }

  protected createResult(receipt: any): TransactionResult {
    return {
      success: true,
      transactionId: receipt?.transactionId?.toString() ?? '',
    };
  }
}
