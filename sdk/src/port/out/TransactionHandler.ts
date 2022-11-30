import TransactionResponse from '../../domain/context/transaction/TransactionResponse.js';
import Long from 'long';
import StableCoinCapabilities from '../../domain/context/stablecoin/StableCoinCapabilities.js';
import BigDecimal from '../../domain/context/shared/BigDecimal.js';

export default interface TransactionHandler<K> {
	wipe(
		coin: StableCoinCapabilities,
		targetId: string,
		amount: BigDecimal,
	): Promise<TransactionResponse>;
	cashin(
		coin: StableCoinCapabilities,
		targetId: string,
		amount: BigDecimal,
	): Promise<TransactionResponse>;
	burn(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
	): Promise<TransactionResponse>;
	freeze(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse>;
	unfreeze(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse>;
	pause(coin: StableCoinCapabilities): Promise<TransactionResponse>;
	unpause(coin: StableCoinCapabilities): Promise<TransactionResponse>;
	rescue(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
	): Promise<TransactionResponse>;
	delete(coin: StableCoinCapabilities): Promise<TransactionResponse>;
	/*contractCall(
		contract: Contract,
		functionName: keyof ABI,
		param: unknown[],
	): Promise<TransactionResponse>;*/
	transfer(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		sourceId: string,
		targetId: string,
	): Promise<TransactionResponse>;
	//signAndSendTransaction(t: K): Promise<TransactionResponse>;
}
