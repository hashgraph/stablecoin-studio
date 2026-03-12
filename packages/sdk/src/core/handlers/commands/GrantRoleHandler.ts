import { Command } from '../../decorators/Command.js';
import { BaseCommandHandler } from '../BaseCommandHandler.js';
import { RoleParams, TransactionResult, ensureBytes32 } from '../types.js';
import { ContractFunctionParameters } from '@hiero-ledger/sdk';

@Command('grantRole')
export class GrantRoleHandler extends BaseCommandHandler<RoleParams, TransactionResult> {
  constructor() {
    super('grantRole', ['function grantRole(bytes32 role, address account)'], 80_000);
  }

  protected mapParamsToArgs(params: RoleParams): unknown[] {
    return [params.role, params.targetId];
  }

  protected buildHederaFunctionParams(params: RoleParams): ContractFunctionParameters {
    return new ContractFunctionParameters()
      .addBytes32(ensureBytes32(params.role))
      .addAddress(params.targetId);
  }

  protected validateParams(params: RoleParams): void {
    if (!params.role) throw new Error('Role required');
    if (!params.targetId) throw new Error('Target account required');
  }

  protected createResult(receipt: any): TransactionResult {
    return {
      success: true,
      transactionId: receipt?.transactionId?.toString() ?? '',
    };
  }
}
