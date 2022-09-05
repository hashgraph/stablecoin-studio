import StableCoinService, {
	StableCoinDetail,
} from './app/service/StableCoin/StableCoinService.js';
import {
	StableCoinServiceRequestModel,
	StableCoinListServiceRequestModel,
} from './app/service/StableCoin/StableCoinServiceRequestModel.js';
import StableCoin from './domain/context/Hedera/StableCoin/StableCoin.js';
import StableCoinRepository from './port/in/StableCoin/StableCoinRepository.js';
import Account from './domain/context/Hedera/Account/Account.js';
import Repository from './port/in/Repository.js';

export { Account, StableCoin, Repository };

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

export interface IRequestContracts {
	treasuryId: string;
	privateKey: string;
	accountId: string;
	amount?: number;
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
		// console.log('SDK Initialised');
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
		const req: StableCoinListServiceRequestModel = { ...request };
		return this.stableCoinService.getListStableCoins(req);
	}

	/**
	 * getStableCoin
	 */
	public getStableCoin(
		request: IGetStableCoinRequest,
	): Promise<StableCoinDetail> | null {
		const req: IGetStableCoinRequest = { ...request };
		return this.stableCoinService.getStableCoin(req);
	}

	/**
	 * getBalanceOf
	 */
	public getBalanceOf(request: IRequestContracts): Promise<[]> | null {
		try {
			const req: IRequestContracts = { ...request };
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

	/**
	 * getName
	 */
	public getNameToken(request: IRequestContracts): Promise<[]> | null {
		try {
			const req: IRequestContracts = { ...request };
			return this.stableCoinService.getNameToken(
				req.treasuryId,
				req.privateKey,
				req.accountId,
			);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * cashIn
	 */
	public cashIn(request: IRequestContracts): Promise<[]> | null {
		try {
			const req: IRequestContracts = { ...request };
			return this.stableCoinService.cashIn(
				req.treasuryId,
				req.privateKey,
				req.accountId,
				req.amount,
			);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * associateToken
	 */
	public associateToken(request: IRequestContracts): Promise<[]> | null {
		try {
			const req: IRequestContracts = { ...request };
			return this.stableCoinService.associateToken(
				req.treasuryId,
				req.privateKey,
				req.accountId,
			);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * wipeToken
	 */
	public wipe(request: IRequestContracts): Promise<[]> | null {
		try {
			const req: IRequestContracts = { ...request };
			return this.stableCoinService.wipe(
				req.treasuryId,
				req.privateKey,
				req.accountId,
				req.amount,
			);
		} catch (error) {
			console.error(error);
			return null;
		}
	}
}
