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

import { OperationConfig } from './configTypes.js';

/**
 * Declarative definitions for all contract write operations.
 *
 * Each entry fully describes the operation: method name, ABI, gas,
 * parameter mapping, and result shape. The generic ConfigDrivenOperation
 * class handles encoding, validation, and result construction automatically.
 *
 * Gas values are aligned with the old SDK (Constants.ts) and include
 * headroom for HTS precompile calls where applicable.
 *
 * To add a new operation, just append a config entry here.
 */
export const OPERATION_CONFIGS: OperationConfig[] = [
  // ── No-arg operations ─────────────────────────────────────────
  { name: 'pause',   method: 'pause',       abi: 'function pause()',       gas: 100_000 },
  { name: 'unpause', method: 'unpause',     abi: 'function unpause()',     gas: 100_000 },
  { name: 'delete',  method: 'deleteToken', abi: 'function deleteToken()', gas: 100_000 },

  // ── Amount operations ─────────────────────────────────────────
  { name: 'burn',       method: 'burn',       abi: 'function burn(int64 amount)',       gas: 100_000,
    args: [{ param: 'amount', type: 'int64' }], resultFields: ['amount'] },
  { name: 'rescue',     method: 'rescue',     abi: 'function rescue(int64 amount)',     gas: 100_000,
    args: [{ param: 'amount', type: 'int64' }], resultFields: ['amount'] },
  { name: 'rescueHBAR', method: 'rescueHBAR', abi: 'function rescueHBAR(uint256 amount)', gas: 100_000,
    args: [{ param: 'amount', type: 'uint256' }], resultFields: ['amount'] },

  // ── Target operations ─────────────────────────────────────────
  { name: 'freeze',    method: 'freeze',    abi: 'function freeze(address account)',    gas: 100_000,
    args: [{ param: 'targetId', type: 'address' }] },
  { name: 'unfreeze',  method: 'unfreeze',  abi: 'function unfreeze(address account)',  gas: 100_000,
    args: [{ param: 'targetId', type: 'address' }] },
  { name: 'grantKyc',  method: 'grantKyc',  abi: 'function grantKyc(address account)',  gas: 100_000,
    args: [{ param: 'targetId', type: 'address' }] },
  { name: 'revokeKyc', method: 'revokeKyc', abi: 'function revokeKyc(address account)', gas: 100_000,
    args: [{ param: 'targetId', type: 'address' }] },

  // ── Target+Amount operations ──────────────────────────────────
  { name: 'cashIn', method: 'mint', abi: 'function mint(address account, int64 amount)', gas: 200_000,
    args: [{ param: 'targetId', type: 'address' }, { param: 'amount', type: 'int64' }],
    resultFields: ['targetId', 'amount'] },
  { name: 'wipe', method: 'wipe', abi: 'function wipe(address account, int64 amount)', gas: 100_000,
    args: [{ param: 'targetId', type: 'address' }, { param: 'amount', type: 'int64' }],
    resultFields: ['targetId', 'amount'] },

  // ── Transfer ──────────────────────────────────────────────────
  // Calls the HTS precompile at 0x167 (not a proxy contract).
  // The handler sets contractAddress = HTS_PRECOMPILE_ADDRESS.
  { name: 'transfer', method: 'transferToken',
    abi: 'function transferToken(address token, address sender, address recipient, int64 amount)', gas: 200_000,
    args: [
      { param: 'tokenAddress', type: 'address' },
      { param: 'fromId', type: 'address' },
      { param: 'targetId', type: 'address' },
      { param: 'amount', type: 'int64' },
    ],
    resultFields: ['fromId', 'targetId', 'amount'] },

  // ── Role operations ───────────────────────────────────────────
  { name: 'grantRole', method: 'grantRole',
    abi: 'function grantRole(bytes32 role, address account)', gas: 200_000,
    args: [{ param: 'role', type: 'bytes32' }, { param: 'targetId', type: 'address' }] },
  { name: 'revokeRole', method: 'revokeRole',
    abi: 'function revokeRole(bytes32 role, address account)', gas: 100_000,
    args: [{ param: 'role', type: 'bytes32' }, { param: 'targetId', type: 'address' }] },

  // ── Allowance & Supplier operations ─────────────────────────
  { name: 'increaseAllowance', method: 'increaseSupplierAllowance',
    abi: 'function increaseSupplierAllowance(address account, uint256 amount)', gas: 120_000,
    args: [{ param: 'targetId', type: 'address' }, { param: 'amount', type: 'uint256' }],
    resultFields: ['targetId', 'amount'] },
  { name: 'decreaseAllowance', method: 'decreaseSupplierAllowance',
    abi: 'function decreaseSupplierAllowance(address account, uint256 amount)', gas: 120_000,
    args: [{ param: 'targetId', type: 'address' }, { param: 'amount', type: 'uint256' }],
    resultFields: ['targetId', 'amount'] },
  { name: 'resetAllowance', method: 'resetSupplierAllowance',
    abi: 'function resetSupplierAllowance(address account)', gas: 100_000,
    args: [{ param: 'targetId', type: 'address' }] },
  { name: 'grantSupplierRole', method: 'grantSupplierRole',
    abi: 'function grantSupplierRole(address account, uint256 amount)', gas: 200_000,
    args: [{ param: 'targetId', type: 'address' }, { param: 'amount', type: 'uint256' }],
    resultFields: ['targetId', 'amount'] },
  { name: 'revokeSupplierRole', method: 'revokeSupplierRole',
    abi: 'function revokeSupplierRole(address account)', gas: 100_000,
    args: [{ param: 'targetId', type: 'address' }] },
  { name: 'grantUnlimitedSupplierRole', method: 'grantUnlimitedSupplierRole',
    abi: 'function grantUnlimitedSupplierRole(address account)', gas: 200_000,
    args: [{ param: 'targetId', type: 'address' }] },

  // ── Hold operations are decorator-driven (HoldOperations.ts) ──
  // They use tuple structs that require ethers ABI encoding on both paths.

  // ── Reserve operations ────────────────────────────────────────
  { name: 'updateReserveAddress', method: 'updateReserveAddress',
    abi: 'function updateReserveAddress(address newAddress)', gas: 100_000,
    args: [{ param: 'reserveAddress', type: 'address' }] },
  // updateReserveAmount calls the reserve contract (not the stablecoin proxy).
  // The reserve contract's function is setAmount(int256).
  { name: 'updateReserveAmount', method: 'setAmount',
    abi: 'function setAmount(int256 newValue)', gas: 100_000,
    args: [{ param: 'amount', type: 'int256', allowZero: true }],
    resultFields: ['amount'] },

  // ── Management operations ─────────────────────────────────────
  { name: 'updateConfigVersion', method: 'updateConfigVersion',
    abi: 'function updateConfigVersion(uint256 configVersion)', gas: 9_000_000,
    args: [{ param: 'configVersion', type: 'uint256', allowZero: true }] },
  { name: 'updateConfig', method: 'updateConfig',
    abi: 'function updateConfig(bytes32 configId, uint256 configVersion)', gas: 9_000_000,
    args: [{ param: 'configId', type: 'bytes32' }, { param: 'configVersion', type: 'uint256', allowZero: true }] },
  { name: 'updateResolver', method: 'updateResolver',
    abi: 'function updateResolver(address resolver, bytes32 configId, uint256 configVersion)', gas: 9_000_000,
    args: [{ param: 'resolver', type: 'address' }, { param: 'configId', type: 'bytes32' }, { param: 'configVersion', type: 'uint256', allowZero: true }] },

  // ── Associate (IHRC precompile) ─────────────────────────────────
  { name: 'associateToken', method: 'associate', abi: 'function associate()', gas: 7_000_000 },
];
