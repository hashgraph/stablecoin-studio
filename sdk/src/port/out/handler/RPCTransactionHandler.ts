import { StableCoin } from '../../../domain/context/stablecoin/StableCoin.js';
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import { HederaERC20__factory } from 'hedera-stable-coin-contracts/typechain-types/index.js';
import TransactionHandler from '../TransactionHandler';
import { BigNumber, ethers } from 'ethers';
import { Response } from '../../../domain/context/transaction/Response.js';
import { RPCTransactionResponseHandler } from './response/RPCTransactionRespondeHandler.js';
import StableCoinCapabilities from '../../../domain/context/stablecoin/StableCoinCapabilities.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';

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
		coin: StableCoinCapabilities,
		targetId: string,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}

	async cashin(
		coin: StableCoinCapabilities,
		targetId: string,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		try {
			const response = await HederaERC20__factory.connect(
				coin.coin.evmProxyAddress ?? '',
				this.wallet,
			).mint(targetId, amount.toBigNumber());

			return RPCTransactionResponseHandler.manageResponse(response);
		} catch (error) {
			// should throw RPCHandlerError
			console.error(error);
			throw new Error('Error');
		}
	}

	async balance(coin: StableCoinCapabilities): Promise<TransactionResponse> {
		const res = await HederaERC20__factory.connect(
			coin.coin.evmProxyAddress ?? '',
			this.wallet,
		).balanceOf(this.metamaskAccount);
		return new TransactionResponse('000.001', res);
	}
	async burn(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	async freeze(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	async unfreeze(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	async pause(coin: StableCoinCapabilities): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	async unpause(coin: StableCoinCapabilities): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	async rescue(coin: StableCoinCapabilities): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	async delete(coin: StableCoinCapabilities): Promise<TransactionResponse> {
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
		coin: StableCoinCapabilities,
		amount: BigDecimal,
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
