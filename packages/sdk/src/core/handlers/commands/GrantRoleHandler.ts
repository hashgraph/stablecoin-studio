/*
 *
 * Hedera Stablecoin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

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
