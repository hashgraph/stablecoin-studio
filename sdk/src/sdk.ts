import { ICreateStableCoinRequest } from './port/in/sdk/request/ICreateStableCoinRequest';
import { IGetListStableCoinRequest } from './port/in/sdk/request/IGetListStableCoinRequest';
import { IGetStableCoinRequest } from './port/in/sdk/request/IGetStableCoinRequest';
import IStableCoinList from './port/in/sdk/response/IStableCoinList.js';
import UtilitiesService from './app/service/utility/UtilitiesService.js';
import ContractsService from './app/service/contract/ContractsService.js';
import ListStableCoinServiceRequestModel from './app/service/stablecoin/model/ListStableCoinServiceRequestModel.js';
import CreateStableCoinServiceRequestModel from './app/service/stablecoin/model/CreateStableCoinServiceRequestModel.js';
import StableCoinService from './app/service/stablecoin/StableCoinService.js';
import StableCoin from './domain/context/hedera/stablecoin/StableCoin.js';
import StableCoinRepository from './port/out/stablecoin/StableCoinRepository.js';
import IStableCoinDetail from './domain/context/hedera/stablecoin/IStableCoinDetail.js';
import Account from './domain/context/hedera/account/Account.js';
import CashInStableCoinServiceRequestModel from './app/service/stablecoin/model/CashInStableCoinServiceRequestModel.js';
import { IGetNameStableCoinRequest } from './port/in/sdk/request/IGetNameStableCoinRequest.js';
import { IGetBalanceStableCoinRequest } from './port/in/sdk/request/IGetBalanceStableCoinRequest.js';
import { ICashInStableCoinRequest } from './port/in/sdk/request/ICashInStableCoinRequest.js';
import GetNameOfStableCoinServiceRequestModel from './app/service/stablecoin/model/GetNameOfStableCoinServiceRequestModel.js';
import GetBalanceOfStableCoinServiceRequestModel from './app/service/stablecoin/model/GetBalanceOfStableCoinServiceRequestModel.js';
import GetStableCoinServiceRequestModel from './app/service/stablecoin/model/GetStableCoinServiceRequestModel.js';
import { IAssociateStableCoinRequest } from './port/in/sdk/request/IAssociateStableCoinRequest.js';
import AssociateTokenStableCoinServiceRequestModel from './app/service/stablecoin/model/AssociateTokenStableCoinServiceRequestModel.js';
import { IWipeStableCoinRequest } from './port/in/sdk/request/IWipeStableCoinRequest.js';
import WipeStableCoinServiceRequestModel from './app/service/stablecoin/model/WipeStableCoinServiceRequestModel.js';

/* Exports */
export { Account };
export {
	IGetNameStableCoinRequest,
	IGetBalanceStableCoinRequest,
	ICashInStableCoinRequest,
	IAssociateStableCoinRequest,
	IWipeStableCoinRequest,
};
export class SDK {
	private utilsService: UtilitiesService;
	private contractsService: ContractsService;
	private stableCoinRepository: StableCoinRepository;
	private stableCoinService: StableCoinService;

	constructor() {
		this.init();
		// console.log('SDK Initialised');
	}

	// Initializes the SDK,
	// TODO should probably be decoupled from the dependency injection
	private init(): void {
		this.contractsService = new ContractsService();
		this.utilsService = new UtilitiesService();
		this.stableCoinRepository = new StableCoinRepository(
			this.utilsService,
			this.contractsService,
		);
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
			const req: CreateStableCoinServiceRequestModel = { ...request };
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
		const req: ListStableCoinServiceRequestModel = { ...request };
		return this.stableCoinService.getListStableCoins(req);
	}

	/**
	 * getStableCoin
	 */
	public getStableCoin(
		request: IGetStableCoinRequest,
	): Promise<IStableCoinDetail> | null {
		const req: GetStableCoinServiceRequestModel = { ...request };
		return this.stableCoinService.getStableCoin(req);
	}

	/**
	 * getBalanceOf
	 */
	public getBalanceOf(
		request: IGetBalanceStableCoinRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: GetBalanceOfStableCoinServiceRequestModel = {
				...request,
			};
			return this.stableCoinService.getBalanceOf(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * getName
	 */
	public getNameToken(
		request: IGetNameStableCoinRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: GetNameOfStableCoinServiceRequestModel = { ...request };
			return this.stableCoinService.getNameToken(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * cashIn
	 */
	public cashIn(
		request: ICashInStableCoinRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: CashInStableCoinServiceRequestModel = { ...request };
			return this.stableCoinService.cashIn(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * associateToken
	 */
	public associateToken(
		request: IAssociateStableCoinRequest,
	): Promise<Uint8Array> | null {
		try {
			const req: AssociateTokenStableCoinServiceRequestModel = {
				...request,
			};
			return this.stableCoinService.associateToken(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	/**
	 * wipeToken
	 */
	public wipe(request: IWipeStableCoinRequest): Promise<Uint8Array> | null {
		try {
			const req: WipeStableCoinServiceRequestModel = { ...request };
			return this.stableCoinService.wipe(req);
		} catch (error) {
			console.error(error);
			return null;
		}
	}
}
