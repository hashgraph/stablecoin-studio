import StableCoin from '../../../domain/context/hedera/stablecoin/StableCoin.js';
import StableCoinRepository from '../../../port/in/stablecoin/StableCoinRepository.js';
import Service from '../Service.js';
import StableCoinServiceRequestModel from './model/StableCoinServiceRequestModel.js';
import StableCoinListServiceRequestModel from './model/StableCoinListServiceRequestModel.js';
import axios from 'axios';
import UtilitiesService from '../utility/UtilitiesService.js';
import { HederaERC20__factory } from 'hedera-stable-coin-contracts/typechain-types';
import IStableCoinList from '../../../domain/context/hedera/stablecoin/interface/IStableCoinList.js';
import ITokenList from '../../../domain/context/hedera/stablecoin/interface/ITokenList.js';
import { IStableCoinDetail } from '../../../domain/context/hedera/stablecoin/interface/IStableCoinDetail.js';

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
	): Promise<IStableCoinList[]> {
		return this.repository.getListStableCoins(req.privateKey);
	}

	/**
	 * getListStableCoins
	 */
	public async getStableCoin(req: {
		stableCoinId: string;
	}): Promise<IStableCoinDetail> {
		return this.repository.getStableCoin(req.stableCoinId);
	}

	public async getBalanceOf(
		treasuryId: string,
		privateKey: string,
		accountId: string,
	): Promise<[]> {
		return this.repository.getBalanceOf(treasuryId, privateKey, accountId);
	}

	public async getNameToken(
		treasuryId: string,
		privateKey: string,
		accountId: string,
	): Promise<[]> {
		return this.repository.getNameToken(treasuryId, privateKey, accountId);
	}

	public async cashIn(
		treasuryId: string,
		privateKey: string,
		accountId: string,
		amount = 1000,
	): Promise<[]> {
		return this.repository.cashIn(
			treasuryId,
			privateKey,
			accountId,
			amount,
		);
	}

	public async associateToken(
		treasuryId: string,
		privateKey: string,
		accountId: string,
	): Promise<[]> {
		return this.repository.associateToken(
			treasuryId,
			privateKey,
			accountId,
		);
	}

	public async wipe(
		treasuryId: string,
		privateKey: string,
		accountId: string,
		amount = 1000,
	): Promise<[]> {
		return this.repository.wipe(treasuryId, privateKey, accountId, amount);
	}
}
