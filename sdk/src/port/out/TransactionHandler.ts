import Transaction from '../../domain/context/transaction/Transaction.js';
import Long from 'long';
import Contract, { ABI } from '../../domain/context/contract/Contract.js';
import StableCoin from '../../domain/context/stablecoin/StableCoin.js';

export default interface TransactionHandler<K> {
	wipe(
		accountId: string,
		tokenId: string,
		amount: Long,
	): Promise<Transaction>;
	mint(coin: StableCoin, amount: Long): Promise<Transaction>;
	burn(coin: StableCoin, amount: Long): Promise<Transaction>;
	freeze(coin: StableCoin, targetId: string): Promise<Transaction>;
	unfreeze(coin: StableCoin, targetId: string): Promise<Transaction>;
	pause(coin: StableCoin): Promise<Transaction>;
	unpause(coin: StableCoin): Promise<Transaction>;
	rescue(coin: StableCoin): Promise<Transaction>;
	delete(coin: StableCoin): Promise<Transaction>;
	contractCall(
		contract: Contract,
		functionName: keyof ABI,
		param: unknown[],
	): Promise<Transaction>;
	transfer(
		coin: StableCoin,
		amount: Long,
		sourceId: string,
		targetId: string,
	): Promise<Transaction>;
	signAndSendTransaction(t: K): Promise<Transaction>;
}
