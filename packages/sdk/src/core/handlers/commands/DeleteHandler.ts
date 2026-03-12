import { Command } from '../../decorators/Command.js';
import { BaseCommandHandler } from '../BaseCommandHandler.js';
import { CommandParams, TransactionResult } from '../types.js';
import { ContractFunctionParameters } from '@hiero-ledger/sdk';

@Command('delete')
export class DeleteHandler extends BaseCommandHandler<CommandParams, TransactionResult> {
  constructor() {
    super('deleteToken', ['function deleteToken()'], 80_000);
  }

  protected mapParamsToArgs(): unknown[] {
    return [];
  }

  protected buildHederaFunctionParams(): ContractFunctionParameters {
    return new ContractFunctionParameters();
  }

  protected createResult(receipt: any): TransactionResult {
    return {
      success: true,
      transactionId: receipt?.transactionId?.toString() ?? '',
    };
  }
}
