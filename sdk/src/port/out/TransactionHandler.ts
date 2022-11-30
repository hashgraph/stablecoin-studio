import TransactionResponse from '../../domain/context/transaction/TransactionResponse.js';
import Long from 'long';
import StableCoinCapabilities from '../../domain/context/stablecoin/StableCoinCapabilities.js';

export default interface TransactionHandler<K> {
	wipe(coin: StableCoinCapabilities, targetId: string, amount: Long): Promise<TransactionResponse>;
	cashin(coin: StableCoinCapabilities, targetId: string, amount: Long): Promise<TransactionResponse>;
	burn(coin: StableCoinCapabilities, amount: Long): Promise<TransactionResponse>;
	freeze(coin: StableCoinCapabilities, targetId: string): Promise<TransactionResponse>;
	unfreeze(coin: StableCoinCapabilities, targetId: string): Promise<TransactionResponse>;
	pause(coin: StableCoinCapabilities): Promise<TransactionResponse>;
	unpause(coin: StableCoinCapabilities): Promise<TransactionResponse>;
	rescue(coin: StableCoinCapabilities, amount: Long): Promise<TransactionResponse>;
	delete(coin: StableCoinCapabilities): Promise<TransactionResponse>;
	/*contractCall(
		contract: Contract,
		functionName: keyof ABI,
		param: unknown[],
	): Promise<TransactionResponse>;*/
	transfer(
		coin: StableCoinCapabilities,
		amount: Long,
		sourceId: string,
		targetId: string,
	): Promise<TransactionResponse>;
	signAndSendTransaction(t: K): Promise<TransactionResponse>;
}
