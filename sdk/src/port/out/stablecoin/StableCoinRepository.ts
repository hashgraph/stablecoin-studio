import { injectable } from 'tsyringe';
import {
	CashInCommand,
	CashInCommandResponse,
} from '../../../app/usecase/stablecoin/cashin/CashInCommand.js';
import Contract from '../../../domain/context/contract/Contract.js';
import StableCoin from '../../../domain/context/stablecoin/StableCoin.js';

@injectable()
export default class StableCoinRepository {
	public map = new Map<CashInCommand, CashInCommandResponse>();

	async getCoin(tokenId: string): Promise<StableCoin>;
	async getCoin(tokenId?: string): Promise<StableCoin> {
		return Promise.resolve(
			new StableCoin(
				new Contract('0.0.1', {}, 'HederaERC20'),
				tokenId ?? '0.0.1',
			),
		);
	}
}
