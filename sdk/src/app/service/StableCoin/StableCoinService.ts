import Service from '../Service.js';
import StableCoin from 'domain/context/Hedera/StableCoin/StableCoin.js';
import StableCoinRepository from 'port/in/StableCoin/StableCoinRepository.js';
import StableCoinServiceRequestModel from './model/StableCoinServiceRequestModel.js';
import StableCoinListServiceRequestModel from './model/StableCoinListServiceRequestModel.js';
import IStableCoinList from 'domain/context/Hedera/StableCoin/interface/IStableCoinList.js';
import IStableCoinDetail from 'domain/context/Hedera/StableCoin/interface/IStableCoinDetail.js';

export default class StableCoinService extends Service {
	private repository: StableCoinRepository;

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
	): Promise<Uint8Array> {
		return this.repository.getBalanceOf(treasuryId, privateKey, accountId);
	}

	public async getNameToken(
		treasuryId: string,
		privateKey: string,
		accountId: string,
	): Promise<Uint8Array> {
		return this.repository.getNameToken(treasuryId, privateKey, accountId);
	}

	public async cashIn(
		treasuryId: string,
		privateKey: string,
		accountId: string,
		amount = 1000,
	): Promise<Uint8Array> {
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
	): Promise<Uint8Array> {
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
	): Promise<Uint8Array> {
		return this.repository.wipe(treasuryId, privateKey, accountId, amount);
	}
}
