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

import { ContractId as HContractId, PublicKey as HPublicKey } from '@hiero-ledger/sdk';
import { ICommandHandler } from '../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator.js';
import ContractId from '../../../../../domain/context/contract/ContractId.js';
import PublicKey from '../../../../../domain/context/account/PublicKey.js';
import { HederaId } from '../../../../../domain/context/shared/HederaId.js';
import { StableCoinRole } from '../../../../../domain/context/stablecoin/StableCoinRole.js';
import { TokenSupplyType } from '../../../../../domain/context/stablecoin/TokenSupply.js';
import AccountService from '../../../../service/AccountService.js';
import TransactionService from '../../../../service/TransactionService.js';
import { OperationNotAllowed } from '../error/OperationNotAllowed.js';
import { CreateCommand, CreateCommandResponse } from './CreateCommand.js';
import { RESERVE_DECIMALS } from '../../../../../domain/context/reserve/Reserve.js';
import { InvalidRequest } from '../error/InvalidRequest.js';
import { AbstractMirrorNodeAdapter } from '../../../../../port/out/mirror/AbstractMirrorNodeAdapter.js';
import { AbstractRPCQueryAdapter } from '../../../../../port/out/rpc/AbstractRPCQueryAdapter.js';
import BigDecimal from '../../../../../domain/context/shared/BigDecimal.js';
import EvmAddress from '../../../../../domain/context/contract/EvmAddress.js';
import { EVM_ZERO_ADDRESS } from '../../../../../core/Constants.js';
import type {
	CreateStableCoinParams,
	CreateStableCoinResult,
	KeyDef,
	RoleDef,
	CashinRoleDef,
} from '../../../../../core/operations/types.js';
import { ethers } from 'ethers';

const UINT256_MAX = (1n << 256n) - 1n;

const KEY_TYPE_BITS = [1, 2, 4, 8, 16, 32, 64];

@CommandHandler(CreateCommand)
export class CreateCommandHandler implements ICommandHandler<CreateCommand> {
	constructor(
		@lazyInject(AccountService)
		public readonly accountService: AccountService,
		@lazyInject(TransactionService)
		public readonly transactionService: TransactionService,
		@lazyInject(AbstractMirrorNodeAdapter)
		public readonly mirrorNodeAdapter: AbstractMirrorNodeAdapter,
		@lazyInject(AbstractRPCQueryAdapter)
		public readonly queryAdapter: AbstractRPCQueryAdapter,
	) {}

	async execute(command: CreateCommand): Promise<CreateCommandResponse> {
		const {
			factory,
			coin,
			reserveAddress,
			updatedAtThreshold,
			reserveInitialAmount,
			createReserve,
			proxyOwnerAccount,
			resolver,
			configId,
			configVersion,
			reserveConfigId,
			reserveConfigVersion,
		} = command;

		// ── Validation ──────────────────────────────────────────────────

		if (!factory) {
			throw new InvalidRequest('Factory not found in request');
		}

		if (!resolver) {
			throw new InvalidRequest('Resolver not found in request');
		}

		if (!configId) {
			throw new InvalidRequest('Config Id not found in request');
		}

		if (!proxyOwnerAccount) {
			throw new InvalidRequest(
				'Proxy Owner Account not found in request',
			);
		}

		if (configVersion === undefined) {
			throw new InvalidRequest('Config Version not found in request');
		}

		if (
			createReserve &&
			(!reserveConfigId || reserveConfigVersion == undefined)
		) {
			throw new InvalidRequest(
				'Cannot create reserve without reserve config id and version',
			);
		}

		if (
			coin.maxSupply &&
			coin.initialSupply &&
			coin.initialSupply.isGreaterThan(coin.maxSupply)
		) {
			throw new OperationNotAllowed(
				'Initial supply cannot be more than the max supply',
			);
		}

		const commonDecimals =
			RESERVE_DECIMALS > coin.decimals ? RESERVE_DECIMALS : coin.decimals;

		if (coin.initialSupply) {
			if (
				createReserve &&
				reserveInitialAmount &&
				coin.initialSupply
					.setDecimals(commonDecimals)
					.isGreaterThan(
						reserveInitialAmount.setDecimals(commonDecimals),
					)
			) {
				throw new OperationNotAllowed(
					'Initial supply cannot be more than the reserve initial amount',
				);
			} else if (reserveAddress) {
				const reserveContractEvmAddress = (
					await this.mirrorNodeAdapter.getContractInfo(
						reserveAddress.value,
					)
				).evmAddress;
				const reserveAmount = BigDecimal.fromStringFixed(
					(
						await this.queryAdapter.getReserveLatestRoundData(
							new EvmAddress(reserveContractEvmAddress),
						)
					)[1].toString(),
					RESERVE_DECIMALS,
				);

				if (
					coin.initialSupply
						.setDecimals(commonDecimals)
						.isGreaterThan(
							reserveAmount.setDecimals(commonDecimals),
						)
				) {
					throw new OperationNotAllowed(
						'Initial supply cannot be more than the reserve initial amount',
					);
				}
			}
		}

		// ── Resolve addresses ───────────────────────────────────────────

		const factoryEvmAddress = (
			await this.mirrorNodeAdapter.getContractInfo(factory.toString())
		).evmAddress;

		const resolverEvmAddress = (
			await this.mirrorNodeAdapter.getContractInfo(resolver.toString())
		).evmAddress;

		const signerEvmAddress = (
			await this.mirrorNodeAdapter.accountToEvmAddress(proxyOwnerAccount)
		).toString();

		const reserveEvmAddress =
			!reserveAddress || reserveAddress.toString() === '0.0.0'
				? undefined
				: (
						await this.mirrorNodeAdapter.getContractInfo(
							reserveAddress.toString(),
						)
				  ).evmAddress;

		// ── Build keys ──────────────────────────────────────────────────

		const providedKeys = [
			coin.adminKey,
			coin.kycKey,
			coin.freezeKey,
			coin.wipeKey,
			coin.supplyKey,
			coin.feeScheduleKey,
			coin.pauseKey,
		];

		const keys: KeyDef[] = [];
		for (let i = 0; i < providedKeys.length; i++) {
			const pk = providedKeys[i];
			if (pk && pk instanceof PublicKey) {
				const isNull = pk.key === PublicKey.NULL.key;
				keys.push({
					keyType: BigInt(KEY_TYPE_BITS[i]),
					publicKey: isNull
						? '0x'
						: ethers.hexlify(
								HPublicKey.fromString(pk.key).toBytesRaw(),
						  ),
					isEd25519: pk.type === 'ED25519',
				});
			}
		}

		// ── Build roles ─────────────────────────────────────────────────

		const baseRoles = [
			{ account: proxyOwnerAccount, role: StableCoinRole.DEFAULT_ADMIN_ROLE },
			{ account: coin.burnRoleAccount, role: StableCoinRole.BURN_ROLE },
			{ account: coin.wipeRoleAccount, role: StableCoinRole.WIPE_ROLE },
			{ account: coin.rescueRoleAccount, role: StableCoinRole.RESCUE_ROLE },
			{ account: coin.pauseRoleAccount, role: StableCoinRole.PAUSE_ROLE },
			{ account: coin.freezeRoleAccount, role: StableCoinRole.FREEZE_ROLE },
			{ account: coin.deleteRoleAccount, role: StableCoinRole.DELETE_ROLE },
			{ account: coin.kycRoleAccount, role: StableCoinRole.KYC_ROLE },
			{ account: coin.feeRoleAccount, role: StableCoinRole.CUSTOM_FEES_ROLE },
			{ account: coin.holdCreatorRoleAccount, role: StableCoinRole.HOLD_CREATOR_ROLE },
		];

		const roles: RoleDef[] = await Promise.all(
			baseRoles
				.filter(
					(r) =>
						r.account &&
						r.account.value !== HederaId.NULL.value,
				)
				.map(async (r) => ({
					role: r.role,
					account: (
						await this.mirrorNodeAdapter.accountToEvmAddress(
							r.account as HederaId,
						)
					).toString(),
				})),
		);

		// ── Build cashinRole ────────────────────────────────────────────

		let cashinRole: CashinRoleDef | undefined;
		if (
			coin.cashInRoleAccount &&
			coin.cashInRoleAccount.toString() !== '0.0.0'
		) {
			const cashinEvmAddress = (
				await this.mirrorNodeAdapter.accountToEvmAddress(
					coin.cashInRoleAccount,
				)
			).toString();
			cashinRole = {
				account: cashinEvmAddress,
				allowance:
					!coin.cashInRoleAllowance ||
					coin.cashInRoleAllowance.toString() === '0'
						? UINT256_MAX
						: BigInt(coin.cashInRoleAllowance.toFixedNumber()),
			};
		}

		// ── Execute operation ───────────────────────────────────────────

		const params: CreateStableCoinParams = {
			name: coin.name,
			symbol: coin.symbol,
			decimals: coin.decimals,
			initialSupply: coin.initialSupply?.toFixedNumber() ?? '0',
			maxSupply: coin.maxSupply?.toFixedNumber() ?? '0',
			finite: coin.supplyType === TokenSupplyType.FINITE,
			factoryAddress: factoryEvmAddress,
			resolverAddress: resolverEvmAddress,
			signerAddress: signerEvmAddress,
			freeze: coin.freezeDefault ?? false,
			createReserve,
			reserveAddress: reserveEvmAddress,
			reserveInitialAmount:
				reserveInitialAmount?.toFixedNumber() ?? '0',
			updatedAtThreshold: updatedAtThreshold ?? '0',
			metadata: coin.metadata ?? '',
			keys: keys.length > 0 ? keys : undefined,
			roles: roles.length > 0 ? roles : undefined,
			cashinRole,
			configId,
			configVersion,
			reserveConfigId: createReserve ? reserveConfigId : undefined,
			reserveConfigVersion: createReserve
				? reserveConfigVersion
				: undefined,
		};

		const result =
			await this.transactionService.executeOperationTyped<CreateStableCoinResult>(
				'create',
				params as unknown as Record<string, unknown>,
			);

		// ── Convert result to domain types ──────────────────────────────

		const tokenId = result.tokenAddress
			? ContractId.fromHederaContractId(
					HContractId.fromEvmAddress(0, 0, result.tokenAddress),
			  )
			: new ContractId('0.0.0');

		let stableCoinProxy: ContractId;
		if (
			result.proxyAddress &&
			result.proxyAddress !== EVM_ZERO_ADDRESS
		) {
			const proxyInfo = await this.mirrorNodeAdapter.getContractInfo(
				result.proxyAddress,
			);
			stableCoinProxy = ContractId.fromHederaContractId(
				HContractId.fromString(proxyInfo.id),
			);
		} else {
			stableCoinProxy = new ContractId('0.0.0');
		}

		let reserveProxy: ContractId;
		if (
			result.reserveProxy &&
			result.reserveProxy !== EVM_ZERO_ADDRESS
		) {
			const reserveInfo = await this.mirrorNodeAdapter.getContractInfo(
				result.reserveProxy,
			);
			reserveProxy = ContractId.fromHederaContractId(
				HContractId.fromString(reserveInfo.id),
			);
		} else {
			reserveProxy = new ContractId('0.0.0');
		}

		return new CreateCommandResponse(
			tokenId,
			stableCoinProxy,
			reserveProxy,
		);
	}
}
