import { Command } from '../../decorators/Command.js';
import { BaseCommandHandler } from '../BaseCommandHandler.js';
import { CommandParams, TransactionResult } from '../types.js';
import { ContractFunctionParameters } from '@hiero-ledger/sdk';

export interface HoldIdParams extends CommandParams {
  holdId: string;
}

@Command('reclaimHold')
export class ReclaimHoldHandler extends BaseCommandHandler<HoldIdParams, TransactionResult> {
  constructor() {
    super('reclaimHold', ['function reclaimHold(bytes32 holdId)'], 80_000);
  }

  protected mapParamsToArgs(params: HoldIdParams): unknown[] {
    return [params.holdId];
  }

  protected buildHederaFunctionParams(params: HoldIdParams): ContractFunctionParameters {
    const holdIdBytes = Buffer.from(params.holdId.replace('0x', ''), 'hex');
    return new ContractFunctionParameters().addBytes32(holdIdBytes);
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
