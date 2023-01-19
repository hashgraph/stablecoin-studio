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

import axios from 'axios';
import { AxiosInstance } from 'axios';
import { singleton } from 'tsyringe';
import StableCoinViewModel from '../../out/mirror/response/StableCoinViewModel.js';
import AccountViewModel from '../../out/mirror/response/AccountViewModel.js';
import StableCoinListViewModel from '../../out/mirror/response/StableCoinListViewModel.js';
import TransactionResultViewModel from '../../out/mirror/response/TransactionResultViewModel.js';
import { Environment } from '../../../domain/context/network/Environment.js';
import LogService from '../../../app/service/LogService.js';
import { StableCoinNotFound } from './error/StableCoinNotFound.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';
import {
	ContractId as HContractId,
	PublicKey as HPublicKey,
} from '@hashgraph/sdk';
import PublicKey from '../../../domain/context/account/PublicKey.js';
import { StableCoinMemo } from '../../../domain/context/stablecoin/StableCoinMemo.js';
import ContractId from '../../../domain/context/contract/ContractId.js';
import { InvalidResponse } from './error/InvalidResponse.js';
import { HederaId } from '../../../domain/context/shared/HederaId.js';
import { KeyType } from '../../../domain/context/account/KeyProps.js';
import AccountTokenListRelationViewModel from './response/AccountTokenListRelationViewModel.js';

@singleton()
export class MirrorNodeAdapter {
	private instance: AxiosInstance;
	private URI_BASE: string;

	constructor() {
		this.setEnvironment('testnet');
	}

	public setEnvironment(environment: Environment): void {
		this.URI_BASE = `${this.getMirrorNodeURL(environment)}/api/v1/`;
		this.instance = axios.create({
			validateStatus: function (status: number) {
				return (status >= 200 && status < 300) || status == 404;
			},
		});
	}

	public async getStableCoinsList(
		accountId: HederaId,
	): Promise<StableCoinListViewModel> {
		try {
			const url = `${
				this.URI_BASE
			}tokens?limit=100&account.id=${accountId.toString()}`;

			LogService.logTrace(
				'Getting stable coin list from mirror node -> ',
				url,
			);

			const resObject: StableCoinListViewModel = {
				coins: [],
			};
			const res = await this.instance.get<ITokenList>(url);
			res.data.tokens.map((item: IToken) => {
				resObject.coins.push({
					id: item.token_id,
					symbol: item.symbol,
				});
			});
			return resObject;
		} catch (error) {
			return Promise.reject<StableCoinListViewModel>(
				new InvalidResponse(error),
			);
		}
	}

	public async getStableCoin(
		tokenId: HederaId,
	): Promise<StableCoinViewModel> {
		try {
			const url = `${this.URI_BASE}tokens/${tokenId.toString()}`;
			LogService.logTrace(
				'Getting stable coin from mirror node -> ',
				url,
			);

			const retry = 10;
			let i = 0;

			let response;
			do {
				if (i > 0)
					await new Promise((resolve) => setTimeout(resolve, 2000));
				response = await this.instance.get<IHederaStableCoinDetail>(
					url,
				);
				i++;
			} while (response.status !== 200 && i < retry);

			const getKeyOrDefault = (
				val?: IPublicKey,
			): ContractId | PublicKey | undefined => {
				if (val?._type === 'ProtobufEncoded') {
					return ContractId.fromProtoBufKey(val.key);
				}
				if (val) {
					return new PublicKey({
						key: val.key,
						type: val._type as KeyType,
					});
				} else {
					return undefined;
				}
			};

			if (response.status !== 200) {
				throw new StableCoinNotFound(tokenId.toString());
			}

			const decimals = parseInt(response.data.decimals ?? '0');
			const proxyAddress = response.data.memo
				? StableCoinMemo.fromJson(response.data.memo).proxyContract
				: '0.0.0';
			const stableCoinDetail: StableCoinViewModel = {
				tokenId: HederaId.from(response.data.token_id),
				name: response.data.name ?? '',
				symbol: response.data.symbol ?? '',
				decimals: decimals,
				initialSupply: response.data.initial_supply
					? BigDecimal.fromStringFixed(
							response.data.initial_supply,
							decimals,
					  )
					: BigDecimal.ZERO,
				totalSupply: response.data.total_supply
					? BigDecimal.fromStringFixed(
							response.data.total_supply,
							decimals,
					  )
					: BigDecimal.ZERO,
				maxSupply: response.data.max_supply
					? BigDecimal.fromStringFixed(
							response.data.max_supply,
							decimals,
					  )
					: undefined,
				proxyAddress: new ContractId(proxyAddress),
				evmProxyAddress:
					HContractId.fromString(proxyAddress).toSolidityAddress(),
				treasury: HederaId.from(response.data.treasury_account_id),
				paused: response.data.pause_status === 'PAUSED',
				deleted: Boolean(response.data.deleted) ?? false,
				freezeDefault: Boolean(response.data.freeze_default) ?? false,
				autoRenewAccount: HederaId.from(
					response.data.auto_renew_account,
				),
				autoRenewAccountPeriod:
					response.data.auto_renew_period / (3600 * 24),
				adminKey: getKeyOrDefault(response.data.admin_key) as PublicKey,
				kycKey: getKeyOrDefault(response.data.kyc_key) as PublicKey,
				freezeKey: getKeyOrDefault(
					response.data.freeze_key,
				) as PublicKey,
				wipeKey: getKeyOrDefault(response.data.wipe_key) as PublicKey,
				supplyKey: getKeyOrDefault(
					response.data.supply_key,
				) as PublicKey,
				pauseKey: getKeyOrDefault(response.data.pause_key) as PublicKey,
			};
			return stableCoinDetail;
		} catch (error) {
			return Promise.reject<StableCoinViewModel>(
				new InvalidResponse(error),
			);
		}
	}

	public async getAccountInfo(
		accountId: HederaId | string,
	): Promise<AccountViewModel> {
		try {
			LogService.logTrace(this.URI_BASE + 'accounts/' + accountId);
			const res = await axios.get<IAccount>(
				this.URI_BASE + 'accounts/' + accountId.toString(),
			);

			const account: AccountViewModel = {
				id: res.data.account.toString(),
				accountEvmAddress: res.data.evm_address,
				publicKey: new PublicKey({
					key: res.data.key.key,
					type: res.data.key._type as KeyType,
				}),
				alias: res.data.alias,
			};

			return account;
		} catch (error) {
			return Promise.reject<AccountViewModel>(new InvalidResponse(error));
		}
	}

	public async getAccountTokens(
		targetId: HederaId,
		tokenId: HederaId,
	): Promise<AccountTokenListRelationViewModel> {
		try {
			const url = `${
				this.URI_BASE
			}accounts/${targetId.toString()}/tokens?token.id=${tokenId.toString()}`;
			LogService.logTrace(url);
			const res = await axios.get<AccountTokenRelationList>(url);

			const resObject: AccountTokenListRelationViewModel = {
				tokens: [],
			};
			if (res.data.tokens) {
				res.data.tokens.map((item: AccountTokenRelation) => {
					resObject.tokens.push({
						automatic_association: item.automatic_association,
						balance: item.balance,
						created_timestamp: item.created_timestamp,
						freeze_status: item.freeze_status,
						kyc_status: item.kyc_status,
						token_id: HederaId.from(item.token_id),
					});
				});
			}

			return resObject;
		} catch (error) {
			return Promise.reject<AccountTokenListRelationViewModel>(
				new InvalidResponse(error),
			);
		}
	}

	public async getTransactionResult(
		transactionId: string,
	): Promise<TransactionResultViewModel> {
		try {
			const url = this.URI_BASE + 'contracts/results/' + transactionId;
			LogService.logTrace(url);
			const res = await axios.get<ITransactionResult>(url);

			if (!res.data.call_result)
				throw new Error(
					'Response does not contain a transaction result',
				);

			const result: TransactionResultViewModel = {
				result: res.data.call_result.toString(),
			};

			return result;
		} catch (error) {
			return Promise.reject<TransactionResultViewModel>(
				new InvalidResponse(error),
			);
		}
	}

	private getMirrorNodeURL(environment: Environment): string {
		switch (environment) {
			case 'mainnet':
				return 'https://mainnet.mirrornode.hedera.com';
			case 'previewnet':
				return 'https://previewnet.mirrornode.hedera.com';
			case 'testnet':
				return 'https://testnet.mirrornode.hedera.com';
			case 'local':
				return 'http://127.0.0.1:5551';
			default:
				return 'https://mainnet.mirrornode.hedera.com';
		}
	}

	async accountToEvmAddress(accountId: HederaId): Promise<string> {
		const accountInfoViewModel: AccountViewModel =
			await this.getAccountInfo(accountId);
		if (accountInfoViewModel.accountEvmAddress) {
			return accountInfoViewModel.accountEvmAddress;
		} else if (accountInfoViewModel.publicKey) {
			return this.getAccountEvmAddressFromPrivateKeyType(
				accountInfoViewModel.publicKey.type,
				accountInfoViewModel.publicKey.key,
				accountId,
			);
		} else {
			return Promise.reject<string>('');
		}
	}

	private async getAccountEvmAddressFromPrivateKeyType(
		privateKeyType: string,
		publicKey: string,
		accountId: HederaId,
	): Promise<string> {
		switch (privateKeyType) {
			case KeyType.ECDSA:
				return HPublicKey.fromString(publicKey).toEthereumAddress();

			default:
				return '0x' + accountId.toHederaAddress().toSolidityAddress();
		}
	}

	async contractToEvmAddress(contractId: ContractId): Promise<string> {
		return HContractId.fromString(
			contractId.toString(),
		).toSolidityAddress();
	}
}

interface IToken {
	symbol: string;
	token_id: string;
	memo: string;
}

interface ITokenList {
	tokens: IToken[];
}
interface AccountTokenRelationList {
	tokens?: AccountTokenRelation[];
}
interface AccountTokenRelation {
	automatic_association: boolean;
	balance: number;
	created_timestamp: string;
	freeze_status: string;
	kyc_status: string;
	token_id: string;
}
interface IHederaStableCoinDetail {
	token_id?: string;
	name?: string;
	symbol?: string;
	decimals?: string;
	initial_supply?: string;
	total_supply?: string;
	max_supply?: string;
	custom_fees?: ICustomFees;
	treasury_account_id?: string;
	expiry_timestamp?: string;
	memo?: string;
	pause_status?: string;
	freeze_default?: boolean;
	auto_renew_account: string;
	auto_renew_period: number;
	deleted?: boolean;
	admin_key?: IPublicKey;
	kyc_key?: IPublicKey;
	freeze_key?: IPublicKey;
	wipe_key?: IPublicKey;
	supply_key?: IPublicKey;
	pause_key?: IPublicKey;
}

interface ICustomFees {
	created_timestamp: string;
	fixed_fees: string[];
	fractional_fees: string[];
}

interface IPublicKey {
	_type: string;
	key: string;
}

interface IAccount {
	evm_address: string;
	key: IKey;
	alias: string;
	account: string;
}

interface ITransactionResult {
	call_result?: string;
}

interface IKey {
	_type: string;
	key: string;
}
