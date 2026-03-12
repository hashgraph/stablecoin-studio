import { Command } from '../../decorators/Command.js';
import { BaseCommandHandler } from '../BaseCommandHandler.js';
import { CreateHoldParams, TransactionResult, ensureBytes32 } from '../types.js';
import { ContractFunctionParameters, Long } from '@hiero-ledger/sdk';

@Command('createHold')
export class CreateHoldHandler extends BaseCommandHandler<CreateHoldParams, TransactionResult> {
  constructor() {
    super('createHold', ['function createHold(bytes32 holdId, address recipient, address notary, uint256 amount, uint256 expiration)'], 150_000);
  }

  protected mapParamsToArgs(params: CreateHoldParams): unknown[] {
    return [params.holdId, params.recipient, params.notary, BigInt(params.amount), BigInt(params.expiration)];
  }

  protected buildHederaFunctionParams(params: CreateHoldParams): ContractFunctionParameters {
    return new ContractFunctionParameters()
      .addBytes32(ensureBytes32(params.holdId))
      .addAddress(params.recipient)
      .addAddress(params.notary)
      .addUint256(Long.fromString(params.amount))
      .addUint256(Long.fromString(params.expiration));
  }

  protected validateParams(params: CreateHoldParams): void {
    if (!params.holdId) throw new Error('Hold ID required');
    if (!params.recipient) throw new Error('Recipient required');
    if (!params.notary) throw new Error('Notary required');
    if (BigInt(params.amount) <= 0n) throw new Error('Amount must be positive');
  }

  protected createResult(receipt: any): TransactionResult {
    return {
      success: true,
      transactionId: receipt?.transactionId?.toString() ?? '',
    };
  }
}
