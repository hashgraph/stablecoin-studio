import { Long } from 'long';
import Contract from '../../../domain/context/contract/Contract.js';
import StableCoin from '../../../domain/context/stablecoin/StableCoin.js';
import Transaction from '../../../domain/context/transaction/Transaction.js';
import {
	HederaERC20__factory,
	HederaERC20ProxyAdmin__factory,
	HederaERC20Proxy__factory,
} from 'hedera-stable-coin-contracts/typechain-types/index.js';
import TransactionHandler from '../TransactionHandler';
import { BigNumber, ethers } from 'ethers';

export default class RPCTransactionHandler
	implements TransactionHandler<RPCTransactionHandler>
{
	provider = new ethers.providers.JsonRpcProvider(
		'https://testnet.hashio.io/api',
	);
	wallet = new ethers.Wallet(
		'1404d4a4a67fb21e7181d147bfdaa7c9b55ebeb7e1a9048bf18d5da6e169c09c',
		this.provider,
	);

	wipe(
		accountId: string,
		tokenId: string,
		amount: Long,
	): Promise<Transaction> {
		throw new Error('Method not implemented.');
	}
	async mint(coin: StableCoin, amount: Long): Promise<Transaction> {
		const stableCoin = HederaERC20__factory.connect(
			coin.evmAddress,
			this.wallet,
		);
		const response = await stableCoin.mint(
			'0x320D33046B60DBc5a027cFB7E4124F75b0417240',

			BigNumber.from('1'),
		);
		console.log(response);

		throw new Error('asd');
	}

	async balance(coin: StableCoin, amount: Long): Promise<Transaction> {
		const stableCoin = HederaERC20__factory.connect(
			coin.evmAddress,
			this.wallet,
		);
		const response = await stableCoin.balanceOf(
			'0x320D33046B60DBc5a027cFB7E4124F75b0417240',
		);
		console.log(response);

		throw new Error('asd');
	}
	async burn(coin: StableCoin, amount: Long): Promise<Transaction> {
		throw new Error('Method not implemented.');
	}
	async freeze(coin: StableCoin, targetId: string): Promise<Transaction> {
		throw new Error('Method not implemented.');
	}
	async unfreeze(coin: StableCoin, targetId: string): Promise<Transaction> {
		throw new Error('Method not implemented.');
	}
	async pause(coin: StableCoin): Promise<Transaction> {
		throw new Error('Method not implemented.');
	}
	async unpause(coin: StableCoin): Promise<Transaction> {
		throw new Error('Method not implemented.');
	}
	async rescue(coin: StableCoin): Promise<Transaction> {
		throw new Error('Method not implemented.');
	}
	async delete(coin: StableCoin): Promise<Transaction> {
		throw new Error('Method not implemented.');
	}
	async contractCall(
		contract: Contract,
		functionName: string,
		param: unknown[],
	): Promise<Transaction> {
		throw new Error('Method not implemented.');
	}
	async transfer(
		coin: StableCoin,
		amount: Long,
		sourceId: string,
		targetId: string,
	): Promise<Transaction> {
		throw new Error('Method not implemented.');
	}
	async signAndSendTransaction(
		t: RPCTransactionHandler,
	): Promise<Transaction> {
		throw new Error('Method not implemented.');
	}
}
