import { singleton } from 'tsyringe';
import { HederaId } from '../../../../domain/context/shared/HederaId.js';
import { StableCoin } from '../../../../domain/context/stablecoin/StableCoin.js';

@singleton()
export default class MirrorNodeQueryHandler {
	async getStableCoin(tokenId: HederaId): Promise<StableCoin> {
		return new StableCoin({
			name: 'HDC',
			symbol: 'HDC',
			decimals: 6,
			tokenId,
			proxyAddress: HederaId.from('0.0.1'),
		});
	}
}
