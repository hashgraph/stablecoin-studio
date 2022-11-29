import TransactionResponse from '../../domain/context/transaction/TransactionResponse.js';
import Long from 'long';
import Contract, { ABI } from '../../domain/context/contract/Contract.js';
import StableCoin from '../../domain/context/stablecoin/StableCoin.js';

export default interface TransactionHandler<K> {
	wipe(coin: StableCoin, targetId: string, amount: Long): Promise<TransactionResponse>;
	mint(coin: StableCoin, amount: Long): Promise<TransactionResponse>;
	burn(coin: StableCoin, amount: Long): Promise<TransactionResponse>;
	freeze(coin: StableCoin, targetId: string): Promise<TransactionResponse>;
	unfreeze(coin: StableCoin, targetId: string): Promise<TransactionResponse>;
	pause(coin: StableCoin): Promise<TransactionResponse>;
	unpause(coin: StableCoin): Promise<TransactionResponse>;
	rescue(coin: StableCoin): Promise<TransactionResponse>;
	delete(coin: StableCoin): Promise<TransactionResponse>;
	/*contractCall(
		contract: Contract,
		functionName: keyof ABI,
		param: unknown[],
	): Promise<TransactionResponse>;*/
	transfer(
		coin: StableCoin,
		amount: Long,
		sourceId: string,
		targetId: string,
	): Promise<TransactionResponse>;
	signAndSendTransaction(t: K): Promise<TransactionResponse>;
}
