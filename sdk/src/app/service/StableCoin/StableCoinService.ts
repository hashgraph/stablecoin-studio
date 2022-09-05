import StableCoin from '../../../domain/context/Hedera/StableCoin/StableCoin.js';
import StableCoinRepository from '../../../port/in/StableCoin/StableCoinRepository.js';
import Service from '../Service.js';
import {
	StableCoinServiceRequestModel,
	StableCoinListServiceRequestModel,
} from './StableCoinServiceRequestModel.js';
import axios from 'axios';
import UtilitiesService from '../Utilities/UtilitiesService.js';
import { HederaERC20__factory } from 'hedera-stable-coin-contracts/typechain-types';
import ContractsService from '../Contracts/ContractsService.js';

export interface Token {
	symbol: string;
	token_id: string;
}

export interface RootObject {
	tokens: Token[];
}

export interface StableCoinList {
	symbol: string;
	id: string;
}

export interface StableCoinDetail {
	token_id?: string;
	name?: string;
	symbol?: string;
	decimals?: string;
	total_supply?: string;
	max_supply?: string;
	custom_fees?: ICustomFees;
	treasury_account_id?: string;
	expiry_timestamp?: string;
	memo?: string;
	pause_status?: string;
	freeze_default?: boolean;
	// kycStatus: string;
	deleted?: boolean;
	admin_key?: IAdminKey;
	kyc_key?: IKYCKey;
	freeze_key?: IFreezeKey;
	wipe_key?: IWipeKey;
	supply_key?: string;
	pause_key?: string;
}

export interface ICustomFees {
	created_timestamp: string;
	fixed_fees: string[];
	fractional_fees: string[];
}

export interface IAdminKey {
	_type: string;
	key: string;
}

export interface IKYCKey {
	_type: string;
	key: string;
}

export interface IFreezeKey {
	_type: string;
	key: string;
}

export interface IWipeKey {
	_type: string;
	key: string;
}

export default class StableCoinService extends Service {
	private repository: StableCoinRepository;

	private URI_BASE = 'https://testnet.mirrornode.hedera.com/api/v1/';

	constructor(repository: StableCoinRepository) {
		super();
		this.repository = repository;
	}

	/**
	 * createStableCoin
	 */
	public createStableCoin(req: StableCoinServiceRequestModel): StableCoin {
		const coin: StableCoin = new StableCoin(
			req.account,
			req.name,
			req.symbol,
			req.decimals,
		);
		return this.repository.saveCoin(coin);
	}

	/**
	 * getListStableCoins
	 */
	public async getListStableCoins(
		req: StableCoinListServiceRequestModel,
	): Promise<StableCoinList[]> {
		const resObject: StableCoinList[] = [];
		const utilsService = new UtilitiesService();

		const publicKey = utilsService.getPublicKey(req.privateKey);

		await axios
			.get<RootObject>(
				this.URI_BASE + 'tokens?limit=100&publickey=' + publicKey,
			)
			.then((response) => {
				response.data.tokens.map((item) => {
					resObject.push({
						id: item.token_id,
						symbol: item.symbol,
					});
				});
			})
			.catch((err) => {
				// TODO: exception
				console.log('error', err);
			});

		return resObject;
	}

	/**
	 * getListStableCoins
	 */
	public async getStableCoin(req: {
		stableCoinId: string;
	}): Promise<StableCoinDetail> {
		let resObject = {};

		await axios
			.get<StableCoinDetail>(this.URI_BASE + 'tokens/' + req.stableCoinId)
			.then((response) => {
				resObject = {
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
				};
			})
			.catch((err) => {
				// TODO: exception
				console.log('error', err);
			});

		return resObject;
	}

	public async getBalanceOf(
		treasuryId: string,
		privateKey: string,
		accountId: string,
	): Promise<Uint8Array> {
		const { AccountId } = require('@hashgraph/sdk');
		const contracts = new ContractsService();

		const clientSdk = contracts.getClient('testnet');
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

		return await contracts.callContract('balanceOf', params);
	}

	public async getNameToken(
		treasuryId: string,
		privateKey: string,
		accountId: string,
	): Promise<Uint8Array> {
		const contracts = new ContractsService();

		const clientSdk = contracts.getClient('testnet');
		clientSdk.setOperator(accountId, privateKey);

		const params = {
			treasuryId,
			parameters: [],
			clientSdk,
			gas: 36000,
			abi: HederaERC20__factory.abi,
		};

		return await contracts.callContract('name', params);
	}

	public async cashIn(
		treasuryId: string,
		privateKey: string,
		accountId: string,
		amount = 1000,
	): Promise<Uint8Array> {
		const { AccountId } = require('@hashgraph/sdk');
		const contracts = new ContractsService();

		const clientSdk = contracts.getClient('testnet');
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

		return await contracts.callContract('mint', params);
	}

	public async associateToken(
		treasuryId: string,
		privateKey: string,
		accountId: string,
	): Promise<Uint8Array> {
		const { AccountId } = require('@hashgraph/sdk');
		const contracts = new ContractsService();

		const clientSdk = contracts.getClient('testnet');
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

		return await contracts.callContract('associateToken', params);
	}

	public async wipe(
		treasuryId: string,
		privateKey: string,
		accountId: string,
		amount = 1000,
	): Promise<Uint8Array> {
		const { AccountId } = require('@hashgraph/sdk');
		const contracts = new ContractsService();

		const clientSdk = contracts.getClient('testnet');
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

		return await contracts.callContract('wipe', params);
	}
}
