import StableCoinService from './app/service/stablecoin/StableCoinService.js';
import StableCoinServiceRequestModel from './app/service/stablecoin/model/StableCoinServiceRequestModel.js';
import StableCoin from './domain/context/hedera/stablecoin/StableCoin.js';
import StableCoinRepository from './port/in/stablecoin/StableCoinRepository.js';
import StableCoinListServiceRequestModel from './app/service/stablecoin/model/StableCoinListServiceRequestModel.js';
import { IStableCoinDetail } from './domain/context/hedera/stablecoin/interface/IStableCoinDetail.js';
import { ICreateStableCoinRequest } from './port/out/request/ICreateStableCoinRequest';
import { IGetListStableCoinRequest } from './port/out/request/IGetListStableCoinRequest';
import { IGetStableCoinRequest } from './port/out/request/IGetStableCoinRequest';
import { IRequestContracts } from './port/out/request/IRequestContracts';
import IStableCoinList from './port/out/request/IStableCoinList.js';
import Account from './domain/context/hedera/account/Account.js';
import UtilitiesService from './app/service/utility/UtilitiesService.js';

export { Account };

export class SDK {
	private utilsService: UtilitiesService;
	private stableCoinRepository: StableCoinRepository;
	private stableCoinService: StableCoinService;

	constructor() {
		this.init();
		// console.log('SDK Initialised');
	}

	// Initializes the SDK,
	// TODO should probably be decoupled from the dependency injection
	private init(): void {
		this.utilsService = new UtilitiesService();
		this.stableCoinRepository = new StableCoinRepository(this.utilsService);
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
	): Promise<IStableCoinList[]> | null {
		const req: StableCoinListServiceRequestModel = { ...request };
		return this.stableCoinService.getListStableCoins(req);
	}

	/**
	 * getStableCoin
	 */
	public getStableCoin(
		request: IGetStableCoinRequest,
	): Promise<IStableCoinDetail> | null {
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
