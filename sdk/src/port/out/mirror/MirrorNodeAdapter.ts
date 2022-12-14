import axios from 'axios';
import { AxiosInstance } from 'axios';
import { singleton } from 'tsyringe';
import StableCoinViewModel from '../../out/mirror/response/StableCoinViewModel.js';
import AccountViewModel from '../../out/mirror/response/AccountViewModel.js';
import StableCoinListViewModel from '../../out/mirror/response/StableCoinListViewModel.js';
import { Environment } from '../../../domain/context/network/Environment.js';
import LogService from '../../../app/service/LogService.js';
import { StableCoinNotFound } from './error/StableCoinNotFound.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';
import { ContractId as HContractId } from '@hashgraph/sdk';
import PublicKey from '../../../domain/context/account/PublicKey.js';
import ContractId from '../../../domain/context/contract/ContractId.js';
import { InvalidResponse } from './error/InvalidResponse.js';
import { HederaId } from '../../../domain/context/shared/HederaId.js';

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
                coins:[] 
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
						type: val._type,
					});
				} else {
					return undefined;
				}
			};

			if (response.status !== 200) {
				throw new StableCoinNotFound(tokenId.toString());
			}

			const decimals = parseInt(response.data.decimals ?? '0');
			const proxyAddress = 
				(response.data.memo) ?  
				HContractId.fromSolidityAddress(response.data.memo).toString()
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
				paused: Boolean(response.data.paused) ?? false,
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
		accountId: HederaId,
	): Promise<AccountViewModel> {
		try {
			LogService.logTrace(this.URI_BASE + 'accounts/' + accountId);
			const res = await axios.get<IAccount>(
				this.URI_BASE + 'accounts/' + accountId,
			);

			const account: AccountViewModel = {
				account: accountId.toString(),
				accountEvmAddress: res.data.evm_address,
				publicKey: new PublicKey({
					key: res.data.key.key,
					type: res.data.key._type,
				}),
				alias: res.data.alias,
			};

			return account;
		} catch (error) {
			return Promise.reject<AccountViewModel>(new InvalidResponse(error));
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
}

interface IToken {
	symbol: string;
	token_id: string;
	memo: string;
}

interface ITokenList {
	tokens: IToken[];
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
	paused?: boolean;
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
}

interface IKey {
	_type: string;
	key: string;
}
