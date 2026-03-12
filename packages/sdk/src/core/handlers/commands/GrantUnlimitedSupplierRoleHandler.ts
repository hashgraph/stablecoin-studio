import { Command } from '../../decorators/Command.js';
import { BaseCommandHandler } from '../BaseCommandHandler.js';
import { TargetParams, TransactionResult } from '../types.js';
import { ContractFunctionParameters } from '@hiero-ledger/sdk';

@Command('grantUnlimitedSupplierRole')
export class GrantUnlimitedSupplierRoleHandler extends BaseCommandHandler<TargetParams, TransactionResult> {
  constructor() {
    super('grantUnlimitedSupplierRole', ['function grantUnlimitedSupplierRole(address account)'], 80_000);
  }

  protected mapParamsToArgs(params: TargetParams): unknown[] {
    return [params.targetId];
  }

  protected buildHederaFunctionParams(params: TargetParams): ContractFunctionParameters {
    return new ContractFunctionParameters().addAddress(params.targetId);
  }

  protected validateParams(params: TargetParams): void {
    if (!params.targetId) throw new Error('Target account required');
  }

  protected createResult(receipt: any): TransactionResult {
    return {
      success: true,
      transactionId: receipt?.transactionId?.toString() ?? '',
    };
  }
}
