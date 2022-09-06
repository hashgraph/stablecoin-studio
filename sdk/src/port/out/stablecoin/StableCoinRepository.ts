import axios from 'axios';
import { HederaERC20__factory } from 'hedera-stable-coin-contracts/typechain-types';
import IStableCoinList from 'port/in/sdk/response/IStableCoinList.js';
import ITokenList from '../../../domain/context/stablecoin/ITokenList.js';
import IStableCoinDetail from '../../../domain/context/stablecoin/IStableCoinDetail.js';
import StableCoin from '../../../domain/context/stablecoin/StableCoin.js';
import IStableCoinRepository from './IStableCoinRepository.js';
import IContractRepository from '../contract/IContractRepository.js';
import { HederaNetwork } from '../../../sdk.js';

export default class StableCoinRepository implements IStableCoinRepository {
	private URI_BASE = 'https://testnet.mirrornode.hedera.com/api/v1/';

	private contractRepository: IContractRepository;

	constructor(contractRepository: IContractRepository) {
		this.contractRepository = contractRepository;
	}

	public async saveCoin(coin: StableCoin): Promise<StableCoin> {
		return new Promise<StableCoin>(() => null);
	}

	public async getListStableCoins(
		privateKey: string,
	): Promise<IStableCoinList[]> {
		try {
			const resObject: IStableCoinList[] = [];
			const pk = this.contractRepository.getPublicKey(privateKey);
			const res = await axios.get<ITokenList>(
				this.URI_BASE + 'tokens?limit=100&publickey=' + pk,
			);
			res.data.tokens.map((item) => {
				resObject.push({
					id: item.token_id,
					symbol: item.symbol,
				});
			});
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
	): Promise<Uint8Array> {
		const { AccountId } = require('@hashgraph/sdk');

		const clientSdk = this.contractRepository.getClient('testnet');
		clientSdk.setOperator(accountId, privateKey);

		const parameters = [
			AccountId.fromString(accountId || '').toSolidityAddress(),
		];

		const params = {
			treasuryId,
			parameters,
			clientSdk,
			gas: 36000,
			abi: HederaERC20__factory.abi,
		};

		return await this.contractRepository.callContract('balanceOf', params);
	}

	public async getNameToken(
		treasuryId: string,
		privateKey: string,
		accountId: string,
	): Promise<Uint8Array> {
		const clientSdk = this.contractRepository.getClient('testnet');
		clientSdk.setOperator(accountId, privateKey);

		const params = {
			treasuryId,
			parameters: [],
			clientSdk,
			gas: 36000,
			abi: HederaERC20__factory.abi,
		};

		return await this.contractRepository.callContract('name', params);
	}

	public async cashIn(
		treasuryId: string,
		privateKey: string,
		accountId: string,
		amount = 1000,
	): Promise<Uint8Array> {
		const { AccountId } = require('@hashgraph/sdk');

		const clientSdk = this.contractRepository.getClient('testnet');
		clientSdk.setOperator(accountId, privateKey);
		const parameters = [
			AccountId.fromString(accountId || '').toSolidityAddress(),
			amount,
		];

		const params = {
			treasuryId,
			parameters,
			clientSdk,
			gas: 400000,
			abi: HederaERC20__factory.abi,
		};

		return await this.contractRepository.callContract('mint', params);
	}

	public async associateToken(
		treasuryId: string,
		privateKey: string,
		accountId: string,
	): Promise<Uint8Array> {
		const { AccountId } = require('@hashgraph/sdk');

		const clientSdk = this.contractRepository.getClient('testnet');
		clientSdk.setOperator(accountId, privateKey);
		const parameters = [
			AccountId.fromString(accountId || '').toSolidityAddress(),
		];

		const params = {
			treasuryId,
			parameters,
			clientSdk,
			gas: 1300000,
			abi: HederaERC20__factory.abi,
		};

		return await this.contractRepository.callContract(
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
		const { AccountId } = require('@hashgraph/sdk');

		const clientSdk = this.contractRepository.getClient('testnet');
		clientSdk.setOperator(accountId, privateKey);
		const parameters = [
			AccountId.fromString(accountId || '').toSolidityAddress(),
			amount,
		];

		const params = {
			treasuryId,
			parameters,
			clientSdk,
			gas: 400000,
			abi: HederaERC20__factory.abi,
		};

		return await this.contractRepository.callContract('wipe', params);
	}

	public async grantSupplierRole(
		treasuryId: string,
		address: string,
		privateKey: string,
		accountId: string,
		amount?: number,
	): Promise<Uint8Array> {
		const { AccountId } = require('@hashgraph/sdk');

		const clientSdk = this.contractRepository.getClient('testnet');
		clientSdk.setOperator(accountId, privateKey);
		const parametersUnlimited = [
			AccountId.fromString(address || '').toSolidityAddress(),
		];
		const parametersLimited = [
			AccountId.fromString(address || '').toSolidityAddress(),
			amount,
		];

		const params = {
			treasuryId,
			parameters: amount ? parametersLimited : parametersUnlimited,
			clientSdk,
			gas: 130000,
			abi: HederaERC20__factory.abi,
		};

		return await this.contractRepository.callContract(
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
		const { AccountId } = require('@hashgraph/sdk');

		const clientSdk = this.contractRepository.getClient('testnet');
		clientSdk.setOperator(accountId, privateKey);
		const parameters = [
			AccountId.fromString(address || '').toSolidityAddress(),
		];

		const params = {
			treasuryId,
			parameters,
			clientSdk,
			gas: 60000,
			abi: HederaERC20__factory.abi,
		};

		return await this.contractRepository.callContract(
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
		const { AccountId } = require('@hashgraph/sdk');

		const clientSdk = this.contractRepository.getClient('testnet');
		clientSdk.setOperator(accountId, privateKey);
		const parameters = [
			AccountId.fromString(address || '').toSolidityAddress(),
		];

		const params = {
			treasuryId,
			parameters,
			clientSdk,
			gas: 60000,
			abi: HederaERC20__factory.abi,
		};

		return await this.contractRepository.callContract(
			'supplierAllowance',
			params,
		);
	}

	public async revokeUnlimitedSupplierRole(
		treasuryId: string,
		address: string,
		privateKey: string,
		accountId: string,
	): Promise<Uint8Array> {
		const { AccountId } = require('@hashgraph/sdk');

		const clientSdk = this.contractRepository.getClient('testnet');
		clientSdk.setOperator(accountId, privateKey);
		const parameters = [
			AccountId.fromString(address || '').toSolidityAddress(),
		];

		const params = {
			treasuryId,
			parameters,
			clientSdk,
			gas: 130000,
			abi: HederaERC20__factory.abi,
		};

		return await this.contractRepository.callContract(
			'revokeUnlimitedSupplierRole',
			params,
		);
	}

	public async revokeSupplierRole(
		treasuryId: string,
		address: string,
		privateKey: string,
		accountId: string,
	): Promise<Uint8Array> {
		const { AccountId } = require('@hashgraph/sdk');

		const clientSdk = this.contractRepository.getClient('testnet');
		clientSdk.setOperator(accountId, privateKey);
		const parameters = [
			AccountId.fromString(address || '').toSolidityAddress(),
		];

		const params = {
			treasuryId,
			parameters,
			clientSdk,
			gas: 130000,
			abi: HederaERC20__factory.abi,
		};

		return await this.contractRepository.callContract(
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
		const { AccountId } = require('@hashgraph/sdk');

		const clientSdk = this.contractRepository.getClient('testnet');
		clientSdk.setOperator(accountId, privateKey);
		const parameters = [
			AccountId.fromString(address || '').toSolidityAddress(),
		];

		const params = {
			treasuryId,
			parameters,
			clientSdk,
			gas: 120000,
			abi: HederaERC20__factory.abi,
		};

		return await this.contractRepository.callContract(
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
		const { AccountId } = require('@hashgraph/sdk');

		const clientSdk = this.contractRepository.getClient('testnet');
		clientSdk.setOperator(accountId, privateKey);
		const parameters = [
			AccountId.fromString(address || '').toSolidityAddress(),
			amount,
		];

		const params = {
			treasuryId,
			parameters,
			clientSdk,
			gas: 130000,
			abi: HederaERC20__factory.abi,
		};

		return await this.contractRepository.callContract(
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
		const { AccountId } = require('@hashgraph/sdk');

		const clientSdk = this.contractRepository.getClient('testnet');
		clientSdk.setOperator(accountId, privateKey);
		const parameters = [
			AccountId.fromString(address || '').toSolidityAddress(),
			amount,
		];

		const params = {
			treasuryId,
			parameters,
			clientSdk,
			gas: 130000,
			abi: HederaERC20__factory.abi,
		};

		return await this.contractRepository.callContract(
			'decreaseSupplierAllowance',
			params,
		);
	}
}
