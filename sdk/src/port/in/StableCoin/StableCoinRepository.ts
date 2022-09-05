import axios from 'axios';
import UtilitiesService from '../../../app/service/utility/UtilitiesService.js';
import Repository from '../Repository.js';
import { HederaERC20__factory } from 'hedera-stable-coin-contracts/typechain-types';
import ContractsService from '../../../app/service/contract/ContractsService.js';
import IStableCoinList from 'port/out/sdk/response/IStableCoinList.js';
import StableCoin from '../../../domain/context/hedera/stablecoin/StableCoin.js';
import ITokenList from '../../../domain/context/hedera/stablecoin/interface/ITokenList.js';
import { IStableCoinDetail } from '../../../domain/context/hedera/stablecoin/interface/IStableCoinDetail.js';

export default class StableCoinRepository extends Repository<StableCoin> {
	private URI_BASE = 'https://testnet.mirrornode.hedera.com/api/v1/';

	private utilsService: UtilitiesService;
	private contractsService: ContractsService;

	constructor(
		utilsService: UtilitiesService,
		contractsService: ContractsService,
	) {
		super();
		this.utilsService = utilsService;
		this.contractsService = contractsService;
	}

	public saveCoin(coin: StableCoin): StableCoin {
		this.data.push(coin);
		return coin;
	}

	public async getListStableCoins(
		privateKey: string,
	): Promise<IStableCoinList[]> {
		try {
			const resObject: IStableCoinList[] = [];
			const pk = this.utilsService.getPublicKey(privateKey);
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

		const clientSdk = this.contractsService.getClient('testnet');
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

		return await this.contractsService.callContract('balanceOf', params);
	}

	public async getNameToken(
		treasuryId: string,
		privateKey: string,
		accountId: string,
	): Promise<Uint8Array> {
		const clientSdk = this.contractsService.getClient('testnet');
		clientSdk.setOperator(accountId, privateKey);

		const params = {
			treasuryId,
			parameters: [],
			clientSdk,
			gas: 36000,
			abi: HederaERC20__factory.abi,
		};

		return await this.contractsService.callContract('name', params);
	}

	public async cashIn(
		treasuryId: string,
		privateKey: string,
		accountId: string,
		amount = 1000,
	): Promise<Uint8Array> {
		const { AccountId } = require('@hashgraph/sdk');

		const clientSdk = this.contractsService.getClient('testnet');
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

		return await this.contractsService.callContract('mint', params);
	}

	public async associateToken(
		treasuryId: string,
		privateKey: string,
		accountId: string,
	): Promise<Uint8Array> {
		const { AccountId } = require('@hashgraph/sdk');

		const clientSdk = this.contractsService.getClient('testnet');
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

		return await this.contractsService.callContract(
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

		const clientSdk = this.contractsService.getClient('testnet');
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

		return await this.contractsService.callContract('wipe', params);
	}
}
