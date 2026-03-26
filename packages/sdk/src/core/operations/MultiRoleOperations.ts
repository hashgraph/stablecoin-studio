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

import { BaseContractOperation } from './BaseContractOperation.js';
import { Operation } from '../decorator/OperationDecorator.js';
import { OperationParams, OperationResult } from './types.js';
import {
  UINT256_MAX,
  GRANT_ROLES_GAS,
  REVOKE_ROLES_GAS,
  MAX_ROLES_GAS,
} from '../Constants.js';

const GRANT_ROLES_ABI = [
  'function grantRoles(bytes32[] roles, address[] accounts, uint256[] amounts)',
];
const REVOKE_ROLES_ABI = [
  'function revokeRoles(bytes32[] roles, address[] accounts)',
];

// ── GrantMultiRoles ────────────────────────────────────────────────────

interface GrantMultiRolesParams extends OperationParams {
  roles: string[];     // bytes32 hex values (StableCoinRole enum)
  accounts: string[];  // EVM addresses
  amounts: string[];   // adjusted integer strings; '0' → UINT256_MAX (unlimited)
}

@Operation('grantMultiRoles')
export class GrantMultiRolesOperation extends BaseContractOperation<
  GrantMultiRolesParams,
  OperationResult
> {
  constructor() {
    super('grantRoles', GRANT_ROLES_ABI, GRANT_ROLES_GAS);
  }

  protected getGas(params: GrantMultiRolesParams): number {
    const gas = params.accounts.length * params.roles.length * GRANT_ROLES_GAS;
    return Math.min(Math.max(gas, GRANT_ROLES_GAS), MAX_ROLES_GAS);
  }

  protected mapParamsToArgs(params: GrantMultiRolesParams): unknown[] {
    const amounts = params.amounts.map((a) => {
      const n = BigInt(a);
      return n > 0n ? n : UINT256_MAX;
    });
    return [params.roles, params.accounts, amounts];
  }
}

// ── RevokeMultiRoles ───────────────────────────────────────────────────

interface RevokeMultiRolesParams extends OperationParams {
  roles: string[];     // bytes32 hex values
  accounts: string[];  // EVM addresses
}

@Operation('revokeMultiRoles')
export class RevokeMultiRolesOperation extends BaseContractOperation<
  RevokeMultiRolesParams,
  OperationResult
> {
  constructor() {
    super('revokeRoles', REVOKE_ROLES_ABI, REVOKE_ROLES_GAS);
  }

  protected getGas(params: RevokeMultiRolesParams): number {
    const gas = params.accounts.length * params.roles.length * REVOKE_ROLES_GAS;
    return Math.min(Math.max(gas, REVOKE_ROLES_GAS), MAX_ROLES_GAS);
  }

  protected mapParamsToArgs(params: RevokeMultiRolesParams): unknown[] {
    return [params.roles, params.accounts];
  }
}
