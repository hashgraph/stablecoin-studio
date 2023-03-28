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
import {
	Environment,
	mainnet,
	testnet,
	previewnet,
	local,
	unrecognized,
} from '../../../domain/context/network/Environment.js';
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
import {
	HBAR_DECIMALS,
	MAX_PERCENTAGE_DECIMALS,
} from '../../../domain/context/fee/CustomFee.js';
import { InvalidResponse } from './error/InvalidResponse.js';
import { HederaId } from '../../../domain/context/shared/HederaId.js';
import { KeyType } from '../../../domain/context/account/KeyProps.js';
import EvmAddress from '../../../domain/context/contract/EvmAddress.js';
import {
	AccountTokenRelationViewModel,
	FreezeStatus,
	KycStatus,
} from './response/AccountTokenRelationViewModel.js';
import { REGEX_TRANSACTION } from '../error/TransactionResponseError.js';
import {
	RequestCustomFee,
	RequestFixedFee,
	RequestFractionalFee,
} from '../../in/request/BaseRequest.js';

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
			LogService.logError(error);
			return Promise.reject<StableCoinListViewModel>(
				new InvalidResponse(error),
			);
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private async getTokenInfo(tokenId: HederaId): Promise<any> {
		const url = `${this.URI_BASE}tokens/${tokenId.toString()}`;

		LogService.logTrace('Getting stable coin from mirror node -> ', url);

		const retry = 10;
		let i = 0;

		let response;
		do {
			if (i > 0)
				await new Promise((resolve) => setTimeout(resolve, 2000));

			response = await this.instance.get<IHederaStableCoinDetail>(url);
			i++;
		} while (response.status !== 200 && i < retry);

		return response;
	}

	public async getStableCoin(
		tokenId: HederaId,
	): Promise<StableCoinViewModel> {
		try {
			const response = await this.getTokenInfo(tokenId);

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

			const getCustomFeesOrDefault = async (
				val?: ICustomFees,
			): Promise<RequestCustomFee[] | undefined> => {
				if (!val) return undefined;
				const customFees: RequestCustomFee[] = [];

				val.fixed_fees.forEach(async (fixedFee) => {
					const denominatingToken = fixedFee.denominating_token_id
						? HederaId.from(fixedFee.denominating_token_id)
						: HederaId.NULL;

					let feeDecimals = decimals;

					if (denominatingToken.isNull()) feeDecimals = HBAR_DECIMALS;
					else if (
						denominatingToken.toString() !== tokenId.toString()
					) {
						feeDecimals = parseInt(
							(await this.getTokenInfo(denominatingToken)).data
								.decimals ?? '0',
						);
					}

					const requestFixedFee: RequestFixedFee = {
						tokenIdCollected: fixedFee.denominating_token_id
							? fixedFee.denominating_token_id
							: '0.0.0',
						amount: BigDecimal.fromStringFixed(
							fixedFee.amount ? fixedFee.amount.toString() : '0',
							feeDecimals,
						).toString(),
						decimals: feeDecimals,
						collectorId: fixedFee.collector_account_id,
						collectorsExempt: fixedFee.all_collectors_are_exempt,
					};

					customFees.push(requestFixedFee);
				});

				val.fractional_fees.forEach((fractionalFee) => {
					const requestFractionalFee: RequestFractionalFee = {
						decimals: decimals,
						collectorId: fractionalFee.collector_account_id,
						collectorsExempt:
							fractionalFee.all_collectors_are_exempt,
						percentage: BigDecimal.fromStringFixed(
							Math.round(
								(100 *
									10 ** MAX_PERCENTAGE_DECIMALS *
									parseInt(fractionalFee.amount.numerator)) /
									parseInt(fractionalFee.amount.denominator),
							).toString(),
							MAX_PERCENTAGE_DECIMALS,
						).toString(),
						amountNumerator: fractionalFee.amount.numerator,
						amountDenominator: fractionalFee.amount.denominator,
						min: BigDecimal.fromStringFixed(
							fractionalFee.minimum
								? fractionalFee.minimum.toString()
								: '0',
							decimals,
						).toString(),
						max: BigDecimal.fromStringFixed(
							fractionalFee.maximum
								? fractionalFee.maximum.toString()
								: '0',
							decimals,
						).toString(),
						net: fractionalFee.net_of_transfers,
					};

					customFees.push(requestFractionalFee);
				});

				return customFees;
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
				evmProxyAddress: EvmAddress.fromContractId(
					new ContractId(proxyAddress),
				),
				treasury: HederaId.from(response.data.treasury_account_id),
				paused: response.data.pause_status === 'PAUSED',
				deleted: Boolean(response.data.deleted) ?? false,
				freezeDefault: Boolean(response.data.freeze_default) ?? false,
				autoRenewAccount: HederaId.from(
					response.data.auto_renew_account,
				),
				autoRenewPeriod: response.data.auto_renew_period,
				expirationTimestamp: response.data.expiry_timestamp,
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
				feeScheduleKey: getKeyOrDefault(
					response.data.fee_schedule_key,
				) as PublicKey,
				customFees: await getCustomFeesOrDefault(
					response.data.custom_fees,
				),
			};
			return stableCoinDetail;
		} catch (error) {
			LogService.logError(error);
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
			LogService.logError(error);
			return Promise.reject<AccountViewModel>(new InvalidResponse(error));
		}
	}

	public async getAccountToken(
		targetId: HederaId,
		tokenId: HederaId,
	): Promise<AccountTokenRelationViewModel | undefined> {
		try {
			const url = `${
				this.URI_BASE
			}accounts/${targetId.toString()}/tokens?token.id=${tokenId.toString()}`;
			LogService.logTrace(url);
			const res = await axios.get<AccountTokenRelationList>(url);
			if (res.data.tokens && res.data.tokens.length > 0) {
				const obj = res.data.tokens[0];
				return {
					automaticAssociation: obj.automatic_association,
					balance: BigDecimal.fromString(obj.balance.toString()),
					createdTimestamp: obj.created_timestamp,
					freezeStatus: obj.freeze_status as FreezeStatus,
					kycStatus: obj.kyc_status as KycStatus,
					tokenId: HederaId.from(obj.token_id),
				};
			} else {
				return undefined;
			}
		} catch (error) {
			LogService.logError(error);
			return Promise.reject<AccountTokenRelationViewModel>(
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
			LogService.logError(error);
			return Promise.reject<TransactionResultViewModel>(
				new InvalidResponse(error),
			);
		}
	}

	public async getTransactionFinalError(
		transactionId: string,
	): Promise<TransactionResultViewModel> {
		try {
			if (transactionId.match(REGEX_TRANSACTION))
				transactionId = transactionId
					.replace('@', '-')
					.replace(/.([^.]*)$/, '-$1');

			const url = this.URI_BASE + 'transactions/' + transactionId;
			LogService.logTrace(url);

			await new Promise((resolve) => setTimeout(resolve, 5000));
			const res = await axios.get<ITransactionList>(url);

			let lastChildtransaction: ITransaction;
			if (res.data.transactions) {
				lastChildtransaction =
					res.data.transactions[res.data.transactions.length - 1];
				LogService.logError(JSON.stringify(lastChildtransaction));
			} else {
				throw new Error('Response does not contain any transaction');
			}

			const result: TransactionResultViewModel = {
				result: lastChildtransaction.result,
			};

			return result;
		} catch (error) {
			LogService.logError(error);
			return Promise.reject<TransactionResultViewModel>(
				new InvalidResponse(error),
			);
		}
	}

	private getMirrorNodeURL(environment: Environment): string {
		switch (environment) {
			case mainnet:
				return 'https://mainnet-public.mirrornode.hedera.com';
			case previewnet:
				return 'https://previewnet.mirrornode.hedera.com';
			case testnet:
				return 'https://testnet.mirrornode.hedera.com';
			case local:
				return 'http://127.0.0.1:5551';
			default:
				return '';
		}
	}

	async accountToEvmAddress(accountId: HederaId): Promise<EvmAddress> {
		const accountInfoViewModel: AccountViewModel =
			await this.getAccountInfo(accountId);
		if (accountInfoViewModel.accountEvmAddress) {
			return new EvmAddress(accountInfoViewModel.accountEvmAddress);
		} else if (accountInfoViewModel.publicKey) {
			return this.getAccountEvmAddressFromPrivateKeyType(
				accountInfoViewModel.publicKey.type,
				accountInfoViewModel.publicKey.key,
				accountId,
			);
		} else {
			return Promise.reject<EvmAddress>('');
		}
	}

	private async getAccountEvmAddressFromPrivateKeyType(
		privateKeyType: string,
		publicKey: string,
		accountId: HederaId,
	): Promise<EvmAddress> {
		switch (privateKeyType) {
			case KeyType.ECDSA:
				return new EvmAddress(
					HPublicKey.fromString(publicKey).toEthereumAddress(),
				);

			default:
				return new EvmAddress(
					'0x' + accountId.toHederaAddress().toSolidityAddress(),
				);
		}
	}

	async contractToEvmAddress(contractId: ContractId): Promise<EvmAddress> {
		return new EvmAddress(
			HContractId.fromString(contractId.toString()).toSolidityAddress(),
		);
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
	freeze_status: 'UNFROZEN' | 'FROZEN';
	kyc_status: 'GRANTED' | 'REVOKED' | 'NOT_APPLICABLE';
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
	fee_schedule_key?: IPublicKey;
}

interface ICustomFees {
	created_timestamp: string;
	fixed_fees: IFixedFee[];
	fractional_fees: IFractionalFee[];
}

interface IFixedFee {
	amount: string;
	collector_account_id: string;
	denominating_token_id: string;
	all_collectors_are_exempt: boolean;
}

interface IFractionalFee {
	amount: IFractionAmount;
	collector_account_id: string;
	denominating_token_id: string;
	maximum: string;
	minimum: string;
	net_of_transfers: boolean;
	all_collectors_are_exempt: boolean;
}

interface IFractionAmount {
	numerator: string;
	denominator: string;
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

interface ITransactionList {
	transactions: ITransaction[];
}

interface ITransaction {
	result: string;
}

interface IKey {
	_type: string;
	key: string;
}
