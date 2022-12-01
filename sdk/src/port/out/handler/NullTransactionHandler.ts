import { singleton } from 'tsyringe';
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import TransactionHandler from '../TransactionHandler.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';
import StableCoinCapabilities from '../../../domain/context/stablecoin/StableCoinCapabilities.js';

@singleton()
export class NullTransactionHandler implements TransactionHandler {
	register(): boolean {
		throw new Error('Method not implemented.');
	}
	stop(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
	wipe(
		coin: StableCoinCapabilities,
		targetId: string,
		amount: BigDecimal,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	cashin(
		coin: StableCoinCapabilities,
		targetId: string,
		amount: BigDecimal,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	burn(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	freeze(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	unfreeze(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	pause(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	unpause(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	rescue(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	delete(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	transfer(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		sourceId: string,
		targetId: string,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
}
