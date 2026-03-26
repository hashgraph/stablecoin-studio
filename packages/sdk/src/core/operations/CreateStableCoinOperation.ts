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

import { Operation } from '../decorator/OperationDecorator.js';
import { BaseContractOperation } from './BaseContractOperation.js';
import { CreateStableCoinParams, CreateStableCoinResult } from './types.js';
import {
  HederaTransaction,
  EVMTransaction,
  AnyReceipt,
} from '../types/ExecutionContext.js';
import {
  ContractExecuteTransaction,
  ContractId,
  Hbar,
} from '@hiero-ledger/sdk';
import { ethers } from 'ethers';
import {
  UINT256_MAX,
  CONFIG_SC,
  CONFIG_RESERVE,
  DEFAULT_VERSION,
} from '../Constants.js';

// ── Factory ABI ─────────────────────────────────────────────────────────────

const FACTORY_ABI = [
  'function deployStableCoin(tuple(string tokenName, string tokenSymbol, bool freeze, bool supplyType, int64 tokenMaxSupply, int64 tokenInitialSupply, int32 tokenDecimals, address reserveAddress, uint256 updatedAtThreshold, int256 reserveInitialAmount, bool createReserve, tuple(uint256 keyType, bytes publicKey, bool isEd25519)[] keys, tuple(bytes32 role, address account)[] roles, tuple(address account, uint256 allowance) cashinRole, string metadata, address businessLogicResolverAddress, tuple(bytes32 key, uint256 version) stableCoinConfigurationId, tuple(bytes32 key, uint256 version) reserveConfigurationId) requestedToken) external payable returns (tuple(address stableCoinProxy, address tokenAddress, address reserveProxy))',
  'event Deployed(tuple(address stableCoinProxy, address tokenAddress, address reserveProxy) deployedStableCoin)',
];

// ── Defaults ────────────────────────────────────────────────────────────────

const DEPLOY_GAS = 4_200_000;
const DEPLOY_HBAR_COST = 45;

// Role hashes — from contracts/scripts/constants.ts
const ROLES = {
  cashin:     '0x53300d27a2268d3ff3ecb0ec8e628321ecfba1a08aed8b817e8acf589a52d25c',
  burn:       '0xe97b137254058bd94f28d2f3eb79e2d34074ffb488d042e3bc958e0a57d2fa22',
  wipe:       '0x515f99f4e5a381c770462a8d9879a01f0fd4a414a168a2404dab62a62e1af0c3',
  rescue:     '0x43f433f336cda92fbbe5bfbdd344a9fd79b2ef138cd6e6fc49d55e2f54e1d99a',
  pause:      '0x139c2898040ef16910dc9f44dc697df79363da767d8bc92f2e310312b816e46d',
  freeze:     '0x5789b43a60de35bcedee40618ae90979bab7d1315fd4b079234241bdab19936d',
  deleteRole: '0x2b73f0f98ad60ca619bbdee4bcd175da1127db86346339f8b718e3f8b4a006e2',
  kyc:        '0xdb11624602202c396fa347735a55e345a3aeb3e60f8885e1a71f1bf8d5886db7',
  hold:       '0xa0edc074322e33cf8b82b4182ff2827f0fef9412190f0e8417c2669a1e8747e4',
};

// ── Operation ───────────────────────────────────────────────────────────────

@Operation('create')
export class CreateStableCoinOperation extends BaseContractOperation<
  CreateStableCoinParams,
  CreateStableCoinResult
> {
  constructor() {
    super('deployStableCoin', FACTORY_ABI, DEPLOY_GAS);
  }

  /**
   * Build the TokenStruct that the factory contract expects.
   * Fills in sensible defaults for keys, roles, and cashin when not provided.
   */
  private buildTokenStruct(params: CreateStableCoinParams) {
    const signer = params.signerAddress;

    const keys = params.keys ?? [
      { keyType: 17n,  publicKey: '0x', isEd25519: false }, // admin + supply
      { keyType: 78n,  publicKey: '0x', isEd25519: false }, // kyc + freeze + wipe + pause
    ];

    const roles = params.roles ?? [
      { role: ROLES.burn,       account: signer },
      { role: ROLES.pause,      account: signer },
      { role: ROLES.wipe,       account: signer },
      { role: ROLES.freeze,     account: signer },
      { role: ROLES.rescue,     account: signer },
      { role: ROLES.deleteRole, account: signer },
      { role: ROLES.kyc,        account: signer },
      { role: ROLES.hold,       account: signer },
    ];

    const cashinRole = params.cashinRole ?? {
      account: signer,
      allowance: UINT256_MAX,
    };

    return {
      tokenName: params.name,
      tokenSymbol: params.symbol,
      freeze: params.freeze ?? false,
      supplyType: params.finite ?? false,
      tokenMaxSupply: BigInt(params.maxSupply ?? '0'),
      tokenInitialSupply: BigInt(params.initialSupply ?? '0'),
      tokenDecimals: params.decimals ?? 6,
      reserveAddress: params.reserveAddress ?? ethers.ZeroAddress,
      updatedAtThreshold: BigInt(params.updatedAtThreshold ?? '0'),
      reserveInitialAmount: BigInt(params.reserveInitialAmount ?? '0'),
      createReserve: params.createReserve ?? false,
      keys,
      roles,
      cashinRole,
      metadata: params.metadata ?? '',
      businessLogicResolverAddress: params.resolverAddress,
      stableCoinConfigurationId: {
        key: params.configId ?? CONFIG_SC,
        version: params.configVersion ?? DEFAULT_VERSION,
      },
      reserveConfigurationId: {
        key: params.reserveConfigId ?? CONFIG_RESERVE,
        version: params.reserveConfigVersion ?? 0,
      },
    };
  }

  // ── Hedera path — encode with ethers, set payable ─────────────────────

  buildHederaTransaction(rawParams: Record<string, unknown>): HederaTransaction {
    const params = rawParams as unknown as CreateStableCoinParams;
    this.validateParams(params);

    const struct = this.buildTokenStruct(params);
    const iface = new ethers.Interface(FACTORY_ABI);
    const calldata = ethers.getBytes(
      iface.encodeFunctionData('deployStableCoin', [struct]),
    );

    return new ContractExecuteTransaction()
      .setContractId(ContractId.fromSolidityAddress(params.factoryAddress))
      .setFunctionParameters(calldata)
      .setGas(DEPLOY_GAS)
      .setPayableAmount(new Hbar(DEPLOY_HBAR_COST));
  }

  // ── EVM path ──────────────────────────────────────────────────────────

  async buildEVMTransaction(rawParams: Record<string, unknown>): Promise<EVMTransaction> {
    const params = rawParams as unknown as CreateStableCoinParams;
    this.validateParams(params);

    const struct = this.buildTokenStruct(params);
    const iface = new ethers.Interface(FACTORY_ABI);
    const data = iface.encodeFunctionData('deployStableCoin', [struct]);

    return {
      to: params.factoryAddress,
      data,
      gasLimit: DEPLOY_GAS,
      value: ethers.parseEther(String(DEPLOY_HBAR_COST)),
    } as unknown as EVMTransaction;
  }

  // ── Result extraction ─────────────────────────────────────────────────

  protected createResult(
    receipt: AnyReceipt,
    _params: CreateStableCoinParams,
  ): CreateStableCoinResult {
    const txId = receipt?.transactionId?.toString() ?? receipt?.hash ?? '';
    const iface = new ethers.Interface(FACTORY_ABI);

    // Hedera path: receipt is a TransactionRecord — logs are in contractFunctionResult.logs
    const hederaLogs = receipt?.contractFunctionResult?.logs ?? [];
    for (const log of hederaLogs) {
      try {
        const topics = (log.topics as Uint8Array[]).map((t) => ethers.hexlify(t));
        const data = ethers.hexlify(log.data as Uint8Array);
        const parsed = iface.parseLog({ topics, data });
        if (parsed?.name === 'Deployed') {
          return {
            success: true,
            transactionId: txId,
            proxyAddress: parsed.args[0].stableCoinProxy,
            tokenAddress: parsed.args[0].tokenAddress,
            reserveProxy: parsed.args[0].reserveProxy,
          };
        }
      } catch { /* not our event */ }
    }

    // EVM path: receipt has logs array with hex topics/data
    const evmLogs = receipt?.logs ?? [];
    for (const log of evmLogs) {
      try {
        const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data });
        if (parsed?.name === 'Deployed') {
          return {
            success: true,
            transactionId: txId,
            proxyAddress: parsed.args[0].stableCoinProxy,
            tokenAddress: parsed.args[0].tokenAddress,
            reserveProxy: parsed.args[0].reserveProxy,
          };
        }
      } catch { /* not our event */ }
    }

    return {
      success: true,
      transactionId: txId,
      proxyAddress: '',
      tokenAddress: '',
      reserveProxy: '',
    };
  }

  protected mapParamsToArgs(params: CreateStableCoinParams): unknown[] {
    return [this.buildTokenStruct(params)];
  }

  // ── Validation ────────────────────────────────────────────────────────

  protected validateParams(params: CreateStableCoinParams): void {
    if (!params.name) throw new Error('Token name is required');
    if (!params.symbol) throw new Error('Token symbol is required');
    if (!params.factoryAddress) throw new Error('Factory address is required');
    if (!params.resolverAddress) throw new Error('Resolver address is required');
    if (!params.signerAddress) throw new Error('Signer address is required');
    const decimals = params.decimals ?? 6;
    if (decimals < 0 || decimals > 18) {
      throw new Error('Decimals must be between 0 and 18');
    }
  }
}
