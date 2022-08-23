import StableCoin
	from '../../../domain/context/Hedera/StableCoin/StableCoin.js';
import Repository from '../Repository.js';

export default class StableCoinRepository extends Repository<StableCoin> {
	constructor() {
		super();
	}

	public saveCoin(coin: StableCoin): StableCoin {
		this.data.push(coin);
		return coin;
	}
}
