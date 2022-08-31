import StableCoinService, {
	StableCoinDetail,
} from './app/service/StableCoin/StableCoinService.js';
import StableCoinServiceRequestModel, {
	StableCoinListServiceRequestModel,
} from './app/service/StableCoin/StableCoinServiceRequestModel.js';
import StableCoin from './domain/context/Hedera/StableCoin/StableCoin.js';
import StableCoinRepository from './port/in/StableCoin/StableCoinRepository.js';
import Account from './domain/context/Hedera/Account/Account.js';

export { Account };
export interface ICreateStableCoinRequest {
	account: Account;
	name: string;
	symbol: string;
	decimals: number;
}

export interface IGetListStableCoinRequest {
	privateKey: string;
}

export interface IGetStableCoinRequest {
	stableCoinId: string;
}

export interface IGetBalanceOf {
	treasuryId: string;
	privateKey: string;
	accountId: string;
}

export interface StableCoinList {
	symbol: string;
	id: string;
}

export class SDK {
	private stableCoinRepository: StableCoinRepository;
	private stableCoinService: StableCoinService;

	constructor() {
		this.init();
		console.log('SDK Initialised');
	}

	// Initializes the SDK,
	// TODO should probably be decoupled from the dependency injection
	private init(): void {
		this.stableCoinRepository = new StableCoinRepository();
		this.stableCoinService = new StableCoinService(
			this.stableCoinRepository,
		);
	}

	/**
	 * createStableCoin
	 */
	public createStableCoin(
		request: ICreateStableCoinRequest,
	): StableCoin | null {
		try {
			const req: StableCoinServiceRequestModel = { ...request };
			return this.stableCoinService.createStableCoin(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * getListStableCoin
	 */
	public getListStableCoin(
		request: IGetListStableCoinRequest,
	): Promise<StableCoinList[]> | null {
		try {
			const req: StableCoinListServiceRequestModel = { ...request };
			return this.stableCoinService.getListStableCoins(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * getStableCoin
	 */
	public getStableCoin(
		request: IGetStableCoinRequest,
	): Promise<StableCoinDetail> | null {
		try {
			const req: IGetStableCoinRequest = { ...request };
			return this.stableCoinService.getStableCoin(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * getBalanceOf
	 */
	public getBalanceOf(
		request: IGetBalanceOf,
	): Promise<{ balance: string }> | null {
		try {
			const req: IGetBalanceOf = { ...request };
			return this.stableCoinService.getBalanceOf(
				req.treasuryId,
				req.privateKey,
				req.accountId,
			);
		} catch (error) {
			console.error(error);
			return null;
		}
	}
}
