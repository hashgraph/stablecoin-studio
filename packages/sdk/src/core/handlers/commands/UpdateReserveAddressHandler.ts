import { Command } from '../../decorators/Command.js';
import { BaseCommandHandler } from '../BaseCommandHandler.js';
import { ReserveAddressParams, TransactionResult } from '../types.js';
import { ContractFunctionParameters } from '@hiero-ledger/sdk';

@Command('updateReserveAddress')
export class UpdateReserveAddressHandler extends BaseCommandHandler<ReserveAddressParams, TransactionResult> {
  constructor() {
    super('updateReserveAddress', ['function updateReserveAddress(address newAddress)'], 80_000);
  }

  protected mapParamsToArgs(params: ReserveAddressParams): unknown[] {
    return [params.reserveAddress];
  }

  protected buildHederaFunctionParams(params: ReserveAddressParams): ContractFunctionParameters {
    return new ContractFunctionParameters().addAddress(params.reserveAddress);
  }

  protected validateParams(params: ReserveAddressParams): void {
    if (!params.reserveAddress) throw new Error('Reserve address required');
  }

  protected createResult(receipt: any): TransactionResult {
    return {
      success: true,
      transactionId: receipt?.transactionId?.toString() ?? '',
    };
  }
}
