import axios from 'axios';
import { HederaERC20__factory } from 'hedera-stable-coin-contracts/typechain-types';
import IStableCoinList from 'port/in/sdk/response/IStableCoinList.js';
import { StableCoin } from '../../../domain/context/stablecoin/StableCoin.js';
import IStableCoinRepository from './IStableCoinRepository.js';
import NetworkAdapter from '../network/NetworkAdapter.js';
import { ICallContractWithAccountRequest } from '../hedera/types.js';
import IStableCoinDetail from './types/IStableCoinDetail.js';
import ITokenList from './types/ITokenList.js';
import HederaError from '../hedera/error/HederaError.js';
import { IToken } from './types/IToken.js';
import PublicKey from '../../../domain/context/account/PublicKey.js';
import PrivateKey from '../../../domain/context/account/PrivateKey.js';
import { AccountId as HAccountId } from '@hashgraph/sdk';
import AccountId from '../../../domain/context/account/AccountId.js';
import { IPublicKey } from './types/IPublicKey.js';
import ContractId from '../../../domain/context/contract/ContractId.js';
import { getHederaNetwork, StableCoinRole } from '../../../core/enum.js';

export default class StableCoinRepository implements IStableCoinRepository {
	private networkAdapter: NetworkAdapter;
	private URI_BASE;

	constructor(networkAdapter: NetworkAdapter) {
		this.networkAdapter = networkAdapter;
		this.URI_BASE = `${
			getHederaNetwork(networkAdapter.network)?.mirrorNodeUrl
		}/api/v1/`;
	}

	public async saveCoin(
		accountId: AccountId,
		privateKey: PrivateKey,
		coin: StableCoin,
	): Promise<StableCoin> {
		try {
			return this.networkAdapter.provider.deployStableCoin(
				accountId.id,
				privateKey.key,
				coin,
			);
		} catch (error) {
			console.error(error);
			throw new HederaError(
				`There was a fatal error deploying the Stable Coin: ${coin.name}`,
			);
		}
	}

	public async getListStableCoins(
		privateKey: PrivateKey,
	): Promise<IStableCoinList[]> {
		try {
			const resObject: IStableCoinList[] = [];
			const pk = this.networkAdapter.provider.getPublicKey(privateKey);
			const res = await axios.get<ITokenList>(
				this.URI_BASE + 'tokens?limit=100&publickey=' + pk,
			);
			res.data.tokens.map((item: IToken) => {
				if (item.memo !== '') {
					resObject.push({
						id: item.token_id,
						symbol: item.symbol,
					});
				}
			});
			return resObject;
		} catch (error) {
			return Promise.reject<IStableCoinList[]>(error);
		}
	}

	public async getStableCoin(id: string): Promise<StableCoin> {
		try {
			const response = await axios.get<IStableCoinDetail>(
				this.URI_BASE + 'tokens/' + id,
			);

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

			return new StableCoin({
				id: response.data.token_id,
				name: response.data.name ?? '',
				symbol: response.data.symbol ?? '',
				decimals: parseInt(response.data.decimals ?? '0'),
				initialSupply: BigInt(response.data.initial_supply ?? '0'),
				totalSupply: BigInt(response.data.total_supply ?? '0'),
				maxSupply: BigInt(response.data.max_supply ?? '0'),
				// customFee: response.data.custom_fees,
				treasury: new AccountId(
					response.data.treasury_account_id ?? '0.0.0',
				),
				// expirationTime: response.data.expiry_timestamp,
				memo: response.data.memo,
				// paused: response.data.pause_status,
				freezeDefault: response.data.freeze_default,
				// kycStatus: string;
				// deleted: response.data.deleted,
				adminKey: getKeyOrDefault(response.data.admin_key) as PublicKey,
				kycKey: getKeyOrDefault(response.data.kyc_key),
				freezeKey: getKeyOrDefault(response.data.freeze_key),
				wipeKey: getKeyOrDefault(response.data.wipe_key),
				supplyKey: getKeyOrDefault(response.data.supply_key),
				// pauseKey: response.data.pause_key,
			});
		} catch (error) {
			return Promise.reject<StableCoin>(error);
		}
	}

	public async getBalanceOf(
		treasuryId: string,
		privateKey: PrivateKey,
		accountId: AccountId,
		targetId: string,
		tokenId: string,
	): Promise<Uint8Array> {
		const parameters = [
			HAccountId.fromString(targetId || '').toSolidityAddress(),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 36000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId: accountId.id,
				privateKey: privateKey.key,
			},
		};

		const response = await this.networkAdapter.provider.callContract(
			'balanceOf',
			params,
		);
		const coin: StableCoin = await this.getStableCoin(tokenId);
		response[0] = coin.fromInteger(response[0]);

		return response;
	}

	public async getNameToken(
		treasuryId: string,
		privateKey: PrivateKey,
		accountId: AccountId,
	): Promise<Uint8Array> {
		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters: [],
			gas: 36000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId: accountId.id,
				privateKey: privateKey.key,
			},
		};

		return await this.networkAdapter.provider.callContract('name', params);
	}

	public async cashIn(
		treasuryId: string,
		privateKey: PrivateKey,
		accountId: AccountId,
		targetId: string,
		amount: number,
	): Promise<Uint8Array> {
		const parameters = [
			HAccountId.fromString(targetId || '').toSolidityAddress(),
			amount,
		];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 400000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId: accountId.id,
				privateKey: privateKey.key,
			},
		};

		return await this.networkAdapter.provider.callContract('mint', params);
	}

	public async associateToken(
		treasuryId: string,
		privateKey: PrivateKey,
		accountId: AccountId,
	): Promise<Uint8Array> {
		const parameters = [
			HAccountId.fromString(accountId.id).toSolidityAddress(),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 1300000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId: accountId.id,
				privateKey: privateKey.key,
			},
		};

		return await this.networkAdapter.provider.callContract(
			'associateToken',
			params,
		);
	}

	public async wipe(
		treasuryId: string,
		privateKey: PrivateKey,
		accountId: AccountId,
		targetId: string,
		amount = 1000,
	): Promise<Uint8Array> {
		const parameters = [
			HAccountId.fromString(targetId || '').toSolidityAddress(),
			amount,
		];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 400000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId: accountId.id,
				privateKey: privateKey.key,
			},
		};

		return await this.networkAdapter.provider.callContract('wipe', params);
	}

	public async grantSupplierRole(
		treasuryId: string,
		address: string,
		privateKey: PrivateKey,
		accountId: AccountId,
		amount?: number,
	): Promise<Uint8Array> {
		const parametersUnlimited = [
			HAccountId.fromString(address || '').toSolidityAddress(),
		];
		const parametersLimited = [
			HAccountId.fromString(address || '').toSolidityAddress(),
			amount,
		];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters: amount ? parametersLimited : parametersUnlimited,
			gas: 250000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId: accountId.id,
				privateKey: privateKey.key,
			},
		};

		return await this.networkAdapter.provider.callContract(
			amount ? 'grantSupplierRole' : 'grantUnlimitedSupplierRole',
			params,
		);
	}

	public async isUnlimitedSupplierAllowance(
		treasuryId: string,
		address: string,
		privateKey: PrivateKey,
		accountId: AccountId,
	): Promise<Uint8Array> {
		const parameters = [
			HAccountId.fromString(address || '').toSolidityAddress(),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 60_000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId: accountId.id,
				privateKey: privateKey.key,
			},
		};

		return await this.networkAdapter.provider.callContract(
			'isUnlimitedSupplierAllowance',
			params,
		);
	}

	public async supplierAllowance(
		treasuryId: string,
		address: string,
		privateKey: PrivateKey,
		accountId: AccountId,
	): Promise<Uint8Array> {
		const parameters = [
			HAccountId.fromString(address || '').toSolidityAddress(),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 60_000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId: accountId.id,
				privateKey: privateKey.key,
			},
		};

		return await this.networkAdapter.provider.callContract(
			'supplierAllowance',
			params,
		);
	}

	public async revokeSupplierRole(
		treasuryId: string,
		address: string,
		privateKey: PrivateKey,
		accountId: AccountId,
	): Promise<Uint8Array> {
		const parameters = [
			HAccountId.fromString(address || '').toSolidityAddress(),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 130000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId: accountId.id,
				privateKey: privateKey.key,
			},
		};

		return await this.networkAdapter.provider.callContract(
			'revokeSupplierRole',
			params,
		);
	}

	public async resetSupplierAllowance(
		treasuryId: string,
		address: string,
		privateKey: PrivateKey,
		accountId: AccountId,
	): Promise<Uint8Array> {
		const parameters = [
			HAccountId.fromString(address || '').toSolidityAddress(),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 120000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId: accountId.id,
				privateKey: privateKey.key,
			},
		};

		return await this.networkAdapter.provider.callContract(
			'resetSupplierAllowance',
			params,
		);
	}

	public async increaseSupplierAllowance(
		treasuryId: string,
		address: string,
		privateKey: PrivateKey,
		accountId: AccountId,
		amount: number,
	): Promise<Uint8Array> {
		const parameters = [
			HAccountId.fromString(address || '').toSolidityAddress(),
			amount,
		];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 130000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId: accountId.id,
				privateKey: privateKey.key,
			},
		};

		return await this.networkAdapter.provider.callContract(
			'increaseSupplierAllowance',
			params,
		);
	}

	public async decreaseSupplierAllowance(
		treasuryId: string,
		address: string,
		privateKey: PrivateKey,
		accountId: AccountId,
		amount: number,
	): Promise<Uint8Array> {
		const parameters = [
			HAccountId.fromString(address || '').toSolidityAddress(),
			amount,
		];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 130000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId: accountId.id,
				privateKey: privateKey.key,
			},
		};

		return await this.networkAdapter.provider.callContract(
			'decreaseSupplierAllowance',
			params,
		);
	}

	public async rescue(
		treasuryId: string,
		privateKey: PrivateKey,
		accountId: AccountId,
		amount = 1000,
	): Promise<Uint8Array> {
		const parameters = [amount];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 140000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId: accountId.id,
				privateKey: privateKey.key,
			},
		};

		return await this.networkAdapter.provider.callContract(
			'rescueToken',
			params,
		);
	}

	public async isLimitedSupplierAllowance(
		treasuryId: string,
		address: string,
		privateKey: PrivateKey,
		accountId: AccountId,
	): Promise<Uint8Array> {
		const parameters = [
			'0xd1ae8bbdabd60d63e418b84f5ad6f9cba90092c9816d7724d85f0d4e4bea2c60',
			HAccountId.fromString(address || '').toSolidityAddress(),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 60000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId: accountId.id,
				privateKey: privateKey.key,
			},
		};

		return await this.networkAdapter.provider.callContract(
			'hasRole',
			params,
		);
	}

	public async grantRole(
		treasuryId: string,
		address: string,
		privateKey: PrivateKey,
		accountId: AccountId,
		role: StableCoinRole,
	): Promise<Uint8Array> {
		const parameters = [
			role,
			HAccountId.fromString(address || '').toSolidityAddress(),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 400000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId: accountId.id,
				privateKey: privateKey.key,
			},
		};

		return await this.networkAdapter.provider.callContract(
			'grantRole',
			params,
		);
	}

	public async revokeRole(
		treasuryId: string,
		address: string,
		privateKey: PrivateKey,
		accountId: AccountId,
		role: StableCoinRole,
	): Promise<Uint8Array> {
		const parameters = [
			role,
			HAccountId.fromString(address || '').toSolidityAddress(),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 400000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId: accountId.id,
				privateKey: privateKey.key,
			},
		};

		return await this.networkAdapter.provider.callContract(
			'revokeRole',
			params,
		);
	}

	public async hasRole(
		treasuryId: string,
		address: string,
		privateKey: PrivateKey,
		accountId: AccountId,
		role: StableCoinRole,
	): Promise<Uint8Array> {
		const parameters = [
			role,
			HAccountId.fromString(address || '').toSolidityAddress(),
		];

		const params: ICallContractWithAccountRequest = {
			contractId: treasuryId,
			parameters,
			gas: 400000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId: accountId.id,
				privateKey: privateKey.key,
			},
		};

		return await this.networkAdapter.provider.callContract(
			'hasRole',
			params,
		);
	}
}
