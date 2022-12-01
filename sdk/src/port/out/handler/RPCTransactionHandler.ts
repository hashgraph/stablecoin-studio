import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import { HederaERC20__factory } from 'hedera-stable-coin-contracts/typechain-types/index.js';
import TransactionHandler from '../TransactionHandler';
import { ethers } from 'ethers';
import { singleton, container } from 'tsyringe';
import { RPCTransactionResponseHandler } from './response/RPCTransactionRespondeHandler.js';
import StableCoinCapabilities from '../../../domain/context/stablecoin/StableCoinCapabilities.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';
import { Injectable } from '../../../core/Injectable.js';

@singleton()
export default class RPCTransactionHandler implements TransactionHandler {
	register(): boolean {
		return !!Injectable.registerTransactionHandler(this);
	}
	stop(): Promise<boolean> {
		return Promise.resolve(!!Injectable.disposeTransactionHandler(this));
	}
	provider = new ethers.providers.JsonRpcProvider(
		'https://testnet.hashio.io/api',
	);
	wallet = new ethers.Wallet(
		'5011cb95478060ccb35b7d9141317eb326f43d6cfb047c0c852bf0fd6f46a929',
		this.provider,
	);
	metamaskAccount = '0x367710d1076ed07d52162d3f45012a89f8bc3335';

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
