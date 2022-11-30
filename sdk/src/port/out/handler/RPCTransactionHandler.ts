import { Long } from 'long';

import StableCoin from '../../../domain/context/stablecoin/StableCoin.js';
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import {
	HederaERC20__factory,
	HederaERC20ProxyAdmin__factory,
	HederaERC20Proxy__factory,
	IHederaTokenService,
	IHederaTokenService__factory,
	HederaERC20,
} from 'hedera-stable-coin-contracts/typechain-types/index.js';
import TransactionHandler from '../TransactionHandler';
import { BigNumber, ethers } from 'ethers';
import { Response } from '../../../domain/context/transaction/Response.js';

const ERROR_STATUS = 1;
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
	metamaskAccount = '0x320D33046B60DBc5a027cFB7E4124F75b0417240';

	async wipe(
		coin: StableCoin,
		targetId: string,
		amount: Long,
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}

	async mint(coin: StableCoin, amount: Long): Promise<TransactionResponse> {
		try {
			const response = await HederaERC20__factory.connect(
				coin.evmProxyAddress,
				this.wallet,
			).mint(
				'0x320D33046B60DBc5a027cFB7E4124F75b0417240',
				BigNumber.from('1'),
			);
			const receipt = await response.wait();
			// Check transaction for error
			if (receipt.status === ERROR_STATUS) {
				return new TransactionResponse(
					receipt.transactionHash,
					undefined,
					new Error('Some error'),
				);
			}
			console.log(response.value);
			return new TransactionResponse(
				receipt.transactionHash,
				response.value,
			);
		} catch (error) {
			// should throw RPCHandlerError
			console.error(error);
			throw new Error('Error');
		}
	}

	async balance(coin: StableCoin): Promise<TransactionResponse> {
		const res = await HederaERC20__factory.connect(
			coin.evmProxyAddress,
			this.wallet,
		).balanceOf(this.metamaskAccount);
		return new TransactionResponse('000.001', res);
	}
	async burn(coin: StableCoin, amount: Long): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	async freeze(
		coin: StableCoin,
		targetId: string,
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	async unfreeze(
		coin: StableCoin,
		targetId: string,
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	async pause(coin: StableCoin): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	async unpause(coin: StableCoin): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	async rescue(coin: StableCoin): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	async delete(coin: StableCoin): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	async contractCall(
		evmProxyAddress: string,
		functionName: string,
		param: unknown[],
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	async transfer(
		coin: StableCoin,
		amount: Long,
		sourceId: string,
		targetId: string,
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	async signAndSendTransaction(
		t: RPCTransactionHandler,
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
}
