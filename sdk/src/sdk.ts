import StableCoinService from './app/service/StableCoin/StableCoinService.js';
import StableCoinServiceRequestModel from './app/service/StableCoin/StableCoinServiceRequestModel.js';
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
}
