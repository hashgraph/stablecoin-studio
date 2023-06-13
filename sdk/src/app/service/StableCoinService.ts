/*
 *
 * Hedera Stable Coin SDK
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

/* eslint-disable @typescript-eslint/no-unused-vars */
import { singleton } from 'tsyringe';
import Injectable from '../../core/Injectable.js';
import AccountService from './AccountService.js';
import Service from './Service.js';
import { QueryBus } from '../../core/query/QueryBus.js';
import { HederaId } from '../../domain/context/shared/HederaId.js';
import StableCoinCapabilities from '../../domain/context/stablecoin/StableCoinCapabilities.js';
import {
	Access,
	Capability,
	Operation,
} from '../../domain/context/stablecoin/Capability.js';
import Account from '../../domain/context/account/Account.js';
import { StableCoin } from '../../domain/context/stablecoin/StableCoin.js';
import PublicKey from '../../domain/context/account/PublicKey.js';
import { GetStableCoinQuery } from '../usecase/query/stablecoin/get/GetStableCoinQuery.js';
import { StableCoinNotFound } from '../../port/out/mirror/error/StableCoinNotFound.js';
import { Console } from 'console';
import { MAX_CUSTOM_FEES } from '../../domain/context/fee/CustomFee.js';
import { toCustomFees } from '../../port/in/request/BaseRequest.js';

@singleton()
export default class StableCoinService extends Service {
	constructor(
		public readonly queryBus: QueryBus = Injectable.resolve<QueryBus>(
			QueryBus,
		),
		public readonly accountService: AccountService = Injectable.resolve<AccountService>(
			AccountService,
		),
	) {
		super();
	}

	async get(tokenId: HederaId): Promise<StableCoin> {
		const viewModel = (
			await this.queryBus.execute(new GetStableCoinQuery(tokenId))
		).coin;
		const { name, decimals, symbol, customFees } = viewModel;
		if (!name || decimals === undefined || !symbol)
			throw new StableCoinNotFound(tokenId);
		const _customFees = toCustomFees(customFees);
		return new StableCoin({
			...viewModel,
			name,
			decimals,
			symbol,
			customFees: _customFees,
		});
	}

	async getCapabilities(
		account: Account,
		target: HederaId | StableCoin,
		tokenIsPaused?: boolean,
		tokenIsDeleted?: boolean,
	): Promise<StableCoinCapabilities> {
		try {
			let _coin: StableCoin;
			const listCapabilities: Capability[] = [];

			if (target instanceof StableCoin) {
				_coin = target;
			} else {
				_coin = await this.get(target);
			}
			const paused =
				tokenIsPaused !== undefined ? tokenIsPaused : _coin.paused;
			const deleted =
				tokenIsDeleted != undefined ? tokenIsDeleted : _coin.deleted;
			const operable = !deleted && !paused;

			if (operable)
				listCapabilities.push(
					new Capability(Operation.RESCUE, Access.CONTRACT),
				);

			if (
				operable &&
				_coin.supplyKey?.toString() === _coin.treasury?.toString()
			) {
				listCapabilities.push(
					new Capability(Operation.CASH_IN, Access.CONTRACT),
				);
				listCapabilities.push(
					new Capability(Operation.BURN, Access.CONTRACT),
				);
			}

			if (operable && _coin.supplyKey instanceof PublicKey) {
				if (
					_coin.supplyKey?.key.toString() === account.publicKey?.key
				) {
					listCapabilities.push(
						new Capability(Operation.CASH_IN, Access.HTS),
					);
					listCapabilities.push(
						new Capability(Operation.BURN, Access.HTS),
					);
				}
			}

			if (operable && _coin.wipeKey instanceof PublicKey) {
				if (_coin.wipeKey?.key.toString() === account.publicKey?.key) {
					listCapabilities.push(
						new Capability(Operation.WIPE, Access.HTS),
					);
				}
			}
			if (operable && _coin.wipeKey instanceof HederaId) {
				listCapabilities.push(
					new Capability(Operation.WIPE, Access.CONTRACT),
				);
			}

			if (!deleted && _coin.pauseKey instanceof PublicKey) {
				if (_coin.pauseKey?.key.toString() === account.publicKey?.key) {
					listCapabilities.push(
						new Capability(Operation.PAUSE, Access.HTS),
					);
					listCapabilities.push(
						new Capability(Operation.UNPAUSE, Access.HTS),
					);
				}
			}
			if (!deleted && _coin.pauseKey instanceof HederaId) {
				listCapabilities.push(
					new Capability(Operation.PAUSE, Access.CONTRACT),
				);
				listCapabilities.push(
					new Capability(Operation.UNPAUSE, Access.CONTRACT),
				);
			}

			if (operable && _coin.freezeKey instanceof PublicKey) {
				if (
					_coin.freezeKey?.key.toString() === account.publicKey?.key
				) {
					listCapabilities.push(
						new Capability(Operation.FREEZE, Access.HTS),
					);
					listCapabilities.push(
						new Capability(Operation.UNFREEZE, Access.HTS),
					);
				}
			}
			if (operable && _coin.freezeKey instanceof HederaId) {
				listCapabilities.push(
					new Capability(Operation.FREEZE, Access.CONTRACT),
				);
				listCapabilities.push(
					new Capability(Operation.UNFREEZE, Access.CONTRACT),
				);
			}
			if (operable && _coin.adminKey instanceof PublicKey) {
				if (_coin.adminKey?.key.toString() === account.publicKey?.key) {
					listCapabilities.push(
						new Capability(Operation.DELETE, Access.HTS),
					);
					listCapabilities.push(
						new Capability(Operation.UPDATE, Access.HTS),
					);
				}
			}
			if (operable && _coin.adminKey instanceof HederaId) {
				listCapabilities.push(
					new Capability(Operation.DELETE, Access.CONTRACT),
				);
				listCapabilities.push(
					new Capability(Operation.UPDATE, Access.CONTRACT),
				);
			}
			if (operable && _coin.kycKey instanceof PublicKey) {
				if (_coin.kycKey?.key.toString() === account.publicKey?.key) {
					listCapabilities.push(
						new Capability(Operation.GRANT_KYC, Access.HTS),
					);
					listCapabilities.push(
						new Capability(Operation.REVOKE_KYC, Access.HTS),
					);
				}
			}
			if (operable && _coin.kycKey instanceof HederaId) {
				listCapabilities.push(
					new Capability(Operation.GRANT_KYC, Access.CONTRACT),
				);
				listCapabilities.push(
					new Capability(Operation.REVOKE_KYC, Access.CONTRACT),
				);
			}
			if (operable && _coin.feeScheduleKey instanceof PublicKey) {
				if (
					_coin.feeScheduleKey?.key.toString() ===
					account.publicKey?.key
				) {
					if (_coin.customFees) {
						if (_coin.customFees.length < MAX_CUSTOM_FEES) {
							listCapabilities.push(
								new Capability(
									Operation.CREATE_CUSTOM_FEE,
									Access.HTS,
								),
							);
						}
						if (_coin.customFees.length > 0) {
							listCapabilities.push(
								new Capability(
									Operation.REMOVE_CUSTOM_FEE,
									Access.HTS,
								),
							);
						}
					}
				}
			}
			if (operable && _coin.feeScheduleKey instanceof HederaId) {
				if (_coin.customFees) {
					if (_coin.customFees.length < MAX_CUSTOM_FEES) {
						listCapabilities.push(
							new Capability(
								Operation.CREATE_CUSTOM_FEE,
								Access.CONTRACT,
							),
						);
					}
					if (_coin.customFees.length > 0) {
						listCapabilities.push(
							new Capability(
								Operation.REMOVE_CUSTOM_FEE,
								Access.CONTRACT,
							),
						);
					}
				}
			}

			listCapabilities.push(
				new Capability(Operation.ROLE_MANAGEMENT, Access.CONTRACT),
			);

			listCapabilities.push(
				new Capability(
					Operation.ROLE_ADMIN_MANAGEMENT,
					Access.CONTRACT,
				),
			);

			listCapabilities.push(
				new Capability(Operation.RESERVE_MANAGEMENT, Access.CONTRACT),
			);

			listCapabilities.push(
				new Capability(Operation.RESCUE_HBAR, Access.CONTRACT),
			);

			return new StableCoinCapabilities(_coin, listCapabilities, account);
		} catch (error) {
			return Promise.reject(error);
		}
	}
}
