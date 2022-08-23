import StableCoin
	from '../../../domain/context/Hedera/StableCoin/StableCoin.js';
import StableCoinRepository
	from '../../../port/in/StableCoin/StableCoinRepository.js';
import Service from '../Service.js';
import StableCoinServiceRequestModel from './StableCoinServiceRequestModel.js';

export default class StableCoinService extends Service {
	private repository: StableCoinRepository;

	constructor(repository: StableCoinRepository) {
		super('StableCoinService');
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
}
