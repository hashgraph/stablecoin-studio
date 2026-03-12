import { Command } from '../../decorators/Command.js';
import { BaseCommandHandler } from '../BaseCommandHandler.js';
import { CommandParams, TransactionResult } from '../types.js';
import { ContractFunctionParameters } from '@hiero-ledger/sdk';

export interface UnpauseResult extends TransactionResult {
  paused: false;
}

@Command('unpause')
export class UnpauseHandler extends BaseCommandHandler<CommandParams, UnpauseResult> {
  constructor() {
    super('unpause', ['function unpause()'], 80_000);
  }

  protected mapParamsToArgs(): unknown[] {
    return [];
  }

  protected buildHederaFunctionParams(): ContractFunctionParameters {
    return new ContractFunctionParameters();
  }

  protected createResult(receipt: any): UnpauseResult {
    return {
      success: true,
      transactionId: receipt?.transactionId?.toString() ?? '',
      paused: false,
    };
  }
}
