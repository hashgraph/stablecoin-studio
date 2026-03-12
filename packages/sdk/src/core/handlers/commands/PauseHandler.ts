import { Command } from '../../decorators/Command.js';
import { BaseCommandHandler } from '../BaseCommandHandler.js';
import { CommandParams, TransactionResult } from '../types.js';
import { ContractFunctionParameters } from '@hiero-ledger/sdk';

export interface PauseResult extends TransactionResult {
  paused: true;
}

@Command('pause')
export class PauseHandler extends BaseCommandHandler<CommandParams, PauseResult> {
  constructor() {
    super('pause', ['function pause()'], 80_000);
  }

  protected mapParamsToArgs(): unknown[] {
    return [];
  }

  protected buildHederaFunctionParams(): ContractFunctionParameters {
    return new ContractFunctionParameters();
  }

  protected createResult(receipt: any): PauseResult {
    return {
      success: true,
      transactionId: receipt?.transactionId?.toString() ?? '',
      paused: true,
    };
  }
}
