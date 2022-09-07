import axios from 'axios';
import { HederaERC20__factory } from 'hedera-stable-coin-contracts/typechain-types';
import IStableCoinList from 'port/in/sdk/response/IStableCoinList.js';
import { StableCoin } from '../../../domain/context/stablecoin/StableCoin.js';
import IStableCoinRepository from './IStableCoinRepository.js';
import NetworkAdapter from '../network/NetworkAdapter.js';
import { AccountId } from '@hashgraph/sdk';
import { IContractParams } from '../hedera/types.js';
import IStableCoinDetail from '../../../app/service/stablecoin/model/stablecoindetail/IStableCoinDetail.js';
import ITokenList from '../../../app/service/stablecoin/model/stablecoindetail/ITokenList.js';
import HederaError from '../hedera/error/HederaError.js';

export default class StableCoinRepository implements IStableCoinRepository {
	private networkAdapter: NetworkAdapter;
	private URI_BASE;

	constructor(networkAdapter: NetworkAdapter) {
		this.networkAdapter = networkAdapter;
		this.URI_BASE = `https://${this.networkAdapter.network}.mirrornode.hedera.com/api/v1/`;
	}

	public async saveCoin(
		accountId: string,
		privateKey: string,
		coin: StableCoin,
	): Promise<StableCoin> {
		try {
			return this.networkAdapter.provider.deployStableCoin(
				accountId,
				privateKey,
				coin,
			);
		} catch (error) {
			console.error(error);
			throw new HederaError(
				`There was a fatal error deploying the Stable Coin: ${coin.name}`
			);
		}
	}

	public async getListStableCoins(
		privateKey: string,
	): Promise<IStableCoinList[]> {
		try {
			const resObject: IStableCoinList[] = [];
			const pk = this.networkAdapter.provider.getPublicKey(privateKey);
			const res = await axios.get<ITokenList>(
				this.URI_BASE + 'tokens?limit=100&publickey=' + pk,
			);
			res.data.tokens.map(
				(item: { memo: string; token_id: string; symbol: string }) => {
					if (item.memo !== '') {
						resObject.push({
							id: item.token_id,
							symbol: item.symbol,
						});
					}
				},
			);
			return resObject;
		} catch (error) {
			return Promise.reject<IStableCoinList[]>(error);
		}
	}

	public async getStableCoin(id: string): Promise<IStableCoinDetail> {
		try {
			const response = await axios.get<IStableCoinDetail>(
				this.URI_BASE + 'tokens/' + id,
			);
			return {
				tokenId: response.data.token_id,
				name: response.data.name,
				symbol: response.data.symbol,
				decimals: response.data.decimals,
				totalSupply: response.data.total_supply,
				maxSupply: response.data.max_supply,
				customFee: response.data.custom_fees,
				treasuryId: response.data.treasury_account_id,
				expirationTime: response.data.expiry_timestamp,
				memo: response.data.memo,
				paused: response.data.pause_status,
				freeze: response.data.freeze_default,
				// kycStatus: string;
				deleted: response.data.deleted,
				adminKey: response.data.admin_key,
				kycKey: response.data.kyc_key,
				freezeKey: response.data.freeze_key,
				wipeKey: response.data.wipe_key,
				supplyKey: response.data.supply_key,
				pauseKey: response.data.pause_key,
			} as IStableCoinDetail;
		} catch (error) {
			return Promise.reject<IStableCoinDetail>(error);
		}
	}

	public async getBalanceOf(
		treasuryId: string,
		privateKey: string,
		accountId: string,
		targetId: string,
	): Promise<Uint8Array> {
		const parameters = [
			AccountId.fromString(targetId || '').toSolidityAddress(),
		];

		const params: IContractParams = {
			contractId: treasuryId,
			parameters,
			gas: 36000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId,
				privateKey,
			},
		};

		return await this.networkAdapter.provider.callContract(
			'balanceOf',
			params,
		);
	}

	public async getNameToken(
		treasuryId: string,
		privateKey: string,
		accountId: string,
	): Promise<Uint8Array> {
		const params: IContractParams = {
			contractId: treasuryId,
			parameters: [],
			gas: 36000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId,
				privateKey,
			},
		};

		return await this.networkAdapter.provider.callContract('name', params);
	}

	public async cashIn(
		treasuryId: string,
		privateKey: string,
		accountId: string,
		amount: number,
	): Promise<Uint8Array> {
		const parameters = [
			AccountId.fromString(accountId || '').toSolidityAddress(),
			amount,
		];

		const params: IContractParams = {
			contractId: treasuryId,
			parameters,
			gas: 400000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId,
				privateKey,
			},
		};

		return await this.networkAdapter.provider.callContract('mint', params);
	}

	public async associateToken(
		treasuryId: string,
		privateKey: string,
		accountId: string,
	): Promise<Uint8Array> {
		const parameters = [
			AccountId.fromString(accountId || '').toSolidityAddress(),
		];

		const params: IContractParams = {
			contractId: treasuryId,
			parameters,
			gas: 1300000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId,
				privateKey,
			},
		};

		return await this.networkAdapter.provider.callContract(
			'associateToken',
			params,
		);
	}

	public async wipe(
		treasuryId: string,
		privateKey: string,
		accountId: string,
		amount = 1000,
	): Promise<Uint8Array> {
		const parameters = [
			AccountId.fromString(accountId || '').toSolidityAddress(),
			amount,
		];

		const params: IContractParams = {
			contractId: treasuryId,
			parameters,
			gas: 400000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId,
				privateKey,
			},
		};

		return await this.networkAdapter.provider.callContract('wipe', params);
	}

	public async grantSupplierRole(
		treasuryId: string,
		address: string,
		privateKey: string,
		accountId: string,
		amount?: number,
	): Promise<Uint8Array> {
		const parametersUnlimited = [
			AccountId.fromString(address || '').toSolidityAddress(),
		];
		const parametersLimited = [
			AccountId.fromString(address || '').toSolidityAddress(),
			amount,
		];

		const params: IContractParams = {
			contractId: treasuryId,
			parameters: amount ? parametersLimited : parametersUnlimited,
			gas: 130000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId,
				privateKey,
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
		privateKey: string,
		accountId: string,
	): Promise<Uint8Array> {
		const parameters = [
			AccountId.fromString(address || '').toSolidityAddress(),
		];

		const params: IContractParams = {
			contractId: treasuryId,
			parameters,
			gas: 60_000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId,
				privateKey,
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
		privateKey: string,
		accountId: string,
	): Promise<Uint8Array> {
		const parameters = [
			AccountId.fromString(address || '').toSolidityAddress(),
		];

		const params: IContractParams = {
			contractId: treasuryId,
			parameters,
			gas: 60_000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId,
				privateKey,
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
		privateKey: string,
		accountId: string,
	): Promise<Uint8Array> {
		const parameters = [
			AccountId.fromString(address || '').toSolidityAddress(),
		];

		const params: IContractParams = {
			contractId: treasuryId,
			parameters,
			gas: 130000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId,
				privateKey,
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
		privateKey: string,
		accountId: string,
	): Promise<Uint8Array> {
		const parameters = [
			AccountId.fromString(address || '').toSolidityAddress(),
		];

		const params: IContractParams = {
			contractId: treasuryId,
			parameters,
			gas: 120000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId,
				privateKey,
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
		privateKey: string,
		accountId: string,
		amount: number,
	): Promise<Uint8Array> {
		const parameters = [
			AccountId.fromString(address || '').toSolidityAddress(),
			amount,
		];

		const params: IContractParams = {
			contractId: treasuryId,
			parameters,
			gas: 130000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId,
				privateKey,
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
		privateKey: string,
		accountId: string,
		amount: number,
	): Promise<Uint8Array> {
		const parameters = [
			AccountId.fromString(address || '').toSolidityAddress(),
			amount,
		];

		const params: IContractParams = {
			contractId: treasuryId,
			parameters,
			gas: 130000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId,
				privateKey,
			},
		};

		return await this.networkAdapter.provider.callContract(
			'decreaseSupplierAllowance',
			params,
		);
	}

	public async rescue(
		treasuryId: string,
		privateKey: string,
		accountId: string,
		amount = 1000,
	): Promise<Uint8Array> {
		const parameters = [amount];

		const params: IContractParams = {
			contractId: treasuryId,
			parameters,
			gas: 140000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId,
				privateKey,
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
		privateKey: string,
		accountId: string,
	): Promise<Uint8Array> {
		const parameters = [
			'0xd1ae8bbdabd60d63e418b84f5ad6f9cba90092c9816d7724d85f0d4e4bea2c60',
			AccountId.fromString(address || '').toSolidityAddress(),
		];

		const params: IContractParams = {
			contractId: treasuryId,
			parameters,
			gas: 60000,
			abi: HederaERC20__factory.abi,
			account: {
				accountId,
				privateKey,
			},
		};

		return await this.networkAdapter.provider.callContract(
			'hasRole',
			params,
		);
	}
}
