/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-case-declarations */
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import { HederaERC20__factory } from 'hedera-stable-coin-contracts/typechain-types/index.js';
import TransactionAdapter from '../TransactionAdapter';
import { ethers, Signer } from 'ethers';
import { singleton, container } from 'tsyringe';
import StableCoinCapabilities from '../../../domain/context/stablecoin/StableCoinCapabilities.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';
import { Injectable } from '../../../core/Injectable.js';
import { RPCTransactionResponseAdapter } from './RPCTransactionRespondeAdapter.js';
import type { Provider } from '@ethersproject/providers';
import { CapabilityDecider, Decision } from '../CapabilityDecider.js';
import { Operation } from '../../../domain/context/stablecoin/Capability.js';
import { CapabilityError } from '../hs/error/CapabilityError.js';

@singleton()
export default class RPCTransactionAdapter implements TransactionAdapter {
	provider = new ethers.providers.JsonRpcProvider(
		'https://testnet.hashio.io/api',
	);
	signerOrProvider: Signer | Provider;

	register(): boolean {
		return !!Injectable.registerTransactionHandler(this);
	}
	stop(): Promise<boolean> {
		return Promise.resolve(!!Injectable.disposeTransactionHandler(this));
	}

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
			switch (CapabilityDecider.decide(coin, Operation.CASH_IN)) {
				case Decision.CONTRACT:
					if (!coin.coin.evmProxyAddress)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have a proxy Address`,
						);

					// eslint-disable-next-line no-case-declarations
					const response = await HederaERC20__factory.connect(
						coin.coin.evmProxyAddress ?? '',
						this.signerOrProvider,
					).mint(targetId, amount.toBigNumber());

					return RPCTransactionResponseAdapter.manageResponse(
						response,
					);
				case Decision.HTS:
					if (!coin.coin.tokenId)
						throw new Error(
							`StableCoin ${coin.coin.name}  does not have an underlying token`,
						);
					throw Error('Not be implemented');

				default:
					const tokenId = coin.coin.tokenId
						? coin.coin.tokenId.value
						: '';
					const OperationNotAllowed = new CapabilityError(
						this.getAccount(),
						Operation.CASH_IN,
						tokenId,
					);
					return new TransactionResponse(
						undefined,
						undefined,
						OperationNotAllowed,
					);
			}
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
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
		t: RPCTransactionAdapter,
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}

	getAccount(): string {
		throw new Error('Method not implemented.');
	}
}
