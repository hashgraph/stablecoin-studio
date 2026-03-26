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

import { QueryConfig } from './configTypes.js';

/**
 * Declarative definitions for all contract view/pure queries.
 *
 * Each entry fully describes the query: method name, ABI, parameter mapping,
 * and how to transform the raw return value. The generic ConfigDrivenQuery
 * class handles argument passing and result construction automatically.
 *
 * To add a new query, just append a config entry here.
 */
export const QUERY_CONFIGS: QueryConfig[] = [
  // ── Balance & Reserve ─────────────────────────────────────────
  { name: 'getBalance', method: 'balanceOf',
    abi: 'function balanceOf(address account) view returns (uint256)',
    args: [{ param: 'targetId', type: 'address' }],
    result: { field: 'balance', transform: 'string' } },
  { name: 'getBurnableAmount', method: 'getBurnableAmount',
    abi: 'function getBurnableAmount() view returns (uint256)',
    result: { field: 'amount', transform: 'string' } },
  { name: 'getReserveAddress', method: 'getReserveAddress',
    abi: 'function getReserveAddress() view returns (address)',
    result: { field: 'reserveAddress', transform: 'string' } },
  { name: 'getReserveAmount', method: 'getReserveAmount',
    abi: 'function getReserveAmount() view returns (uint256)',
    result: { field: 'amount', transform: 'string' } },

  // ── Roles ─────────────────────────────────────────────────────
  { name: 'hasRole', method: 'hasRole',
    abi: 'function hasRole(bytes32 role, address account) view returns (bool)',
    args: [{ param: 'role', type: 'bytes32' }, { param: 'targetId', type: 'address' }],
    result: { field: 'hasRole', transform: 'boolean' } },
  { name: 'getRoles', method: 'getRoles',
    abi: 'function getRoles(address account) view returns (bytes32[])',
    args: [{ param: 'targetId', type: 'address' }],
    result: { field: 'roles', transform: 'strings' } },
  { name: 'getAccountsWithRoles', method: 'getAccountsWithRole',
    abi: 'function getAccountsWithRole(bytes32 role) view returns (address[])',
    args: [{ param: 'role', type: 'bytes32' }],
    result: { field: 'accounts', transform: 'strings' } },
  { name: 'getAllowance', method: 'getSupplierAllowance',
    abi: 'function getSupplierAllowance(address supplier) view returns (uint256)',
    args: [{ param: 'targetId', type: 'address' }],
    result: { field: 'allowance', transform: 'string' } },
  { name: 'isUnlimited', method: 'isUnlimitedSupplierAllowance',
    abi: 'function isUnlimitedSupplierAllowance(address account) view returns (bool)',
    args: [{ param: 'targetId', type: 'address' }],
    result: { field: 'isUnlimited', transform: 'boolean' } },

  // ── Holds ─────────────────────────────────────────────────────
  { name: 'getHeldAmount', method: 'getHeldAmountFor',
    abi: 'function getHeldAmountFor(address account) view returns (uint256)',
    args: [{ param: 'targetId', type: 'address' }],
    result: { field: 'amount', transform: 'string' } },
  { name: 'getHoldCount', method: 'getHoldCountFor',
    abi: 'function getHoldCountFor(address account) view returns (uint256)',
    args: [{ param: 'targetId', type: 'address' }],
    result: { field: 'count', transform: 'number' } },
  { name: 'getHoldsId', method: 'getHoldsIdFor',
    abi: 'function getHoldsIdFor(address _tokenHolder, uint256 _pageIndex, uint256 _pageLength) view returns (uint256[])',
    args: [
      { param: 'targetId', type: 'address' },
      { param: 'start', type: 'uint256' },
      { param: 'end', type: 'uint256' },
    ],
    result: { field: 'holdIds', transform: 'strings' } },
];
