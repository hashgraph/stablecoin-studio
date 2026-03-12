import { Command } from '../../decorators/Command.js';
import { BaseCommandHandler } from '../BaseCommandHandler.js';
import { CommandParams, TransactionResult } from '../types.js';
import { ContractFunctionParameters } from '@hiero-ledger/sdk';

export interface RoleParams extends CommandParams {
  role: string;
  targetId: string;
}

@Command('revokeRole')
export class RevokeRoleHandler extends BaseCommandHandler<RoleParams, TransactionResult> {
  constructor() {
    super('revokeRole', ['function revokeRole(bytes32 role, address account)'], 80_000);
  }

  protected mapParamsToArgs(params: RoleParams): unknown[] {
    return [params.role, params.targetId];
  }

  protected buildHederaFunctionParams(params: RoleParams): ContractFunctionParameters {
    const roleBytes = Buffer.from(params.role.replace('0x', ''), 'hex');
    return new ContractFunctionParameters()
      .addBytes32(roleBytes)
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
