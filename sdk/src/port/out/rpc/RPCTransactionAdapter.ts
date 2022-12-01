/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-case-declarations */
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import {
	HederaERC20__factory,
	IHederaTokenService__factory,
} from 'hedera-stable-coin-contracts/typechain-types/index.js';
import TransactionAdapter from '../TransactionAdapter';
import { ContractTransaction, ethers, Signer } from 'ethers';
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
		try {
			switch (CapabilityDecider.decide(coin, Operation.WIPE)) {
				case Decision.CONTRACT:
					if (!coin.coin.evmProxyAddress)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have a proxy Address`,
						);

					return RPCTransactionResponseAdapter.manageResponse(
						await HederaERC20__factory.connect(
							coin.coin.evmProxyAddress ?? '',
							this.signerOrProvider,
						).mint(targetId, amount.toBigNumber()),
					);
					break;
				case Decision.HTS:
					if (!coin.coin.tokenId)
						throw new Error(
							`StableCoin ${coin.coin.name}  does not have an underlying token`,
						);
					throw Error('Not be implemented');
					break;
				default:
					const tokenId = coin.coin.tokenId
						? coin.coin.tokenId.value
						: '';
					const OperationNotAllowed = new CapabilityError(
						this.getAccount(),
						Operation.WIPE,
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

					return RPCTransactionResponseAdapter.manageResponse(
						await HederaERC20__factory.connect(
							coin.coin.evmProxyAddress ?? '',
							this.signerOrProvider,
						).mint(targetId, amount.toBigNumber()),
					);
					break;
				case Decision.HTS:
					if (!coin.coin.evmProxyAddress)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have a proxy Address`,
						);
					if (!coin.coin.tokenId)
						throw new Error(
							`StableCoin ${coin.coin.name}  does not have an underlying token`,
						);
					return RPCTransactionResponseAdapter.manageResponse(
						await this.precompiledCall('mintToken', [
							targetId,
							amount.toBigNumber(),
							[],
						]),
					);

					break;
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
		try {
			switch (CapabilityDecider.decide(coin, Operation.BURN)) {
				case Decision.CONTRACT:
					if (!coin.coin.evmProxyAddress)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have a proxy Address`,
						);

					return RPCTransactionResponseAdapter.manageResponse(
						await HederaERC20__factory.connect(
							coin.coin.evmProxyAddress ?? '',
							this.signerOrProvider,
						).burn(amount.toBigNumber()),
					);
					break;
				case Decision.HTS:
					if (!coin.coin.tokenId)
						throw new Error(
							`StableCoin ${coin.coin.name}  does not have an underlying token`,
						);
					throw Error('Not be implemented');
					break;
				default:
					const tokenId = coin.coin.tokenId
						? coin.coin.tokenId.value
						: '';
					const OperationNotAllowed = new CapabilityError(
						this.getAccount(),
						Operation.BURN,
						tokenId,
					);
					return new TransactionResponse(
						undefined,
						undefined,
						OperationNotAllowed,
					);
					break;
			}
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async freeze(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse> {
		try {
			switch (CapabilityDecider.decide(coin, Operation.FREEZE)) {
				case Decision.CONTRACT:
					if (!coin.coin.evmProxyAddress)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have a proxy Address`,
						);

					return RPCTransactionResponseAdapter.manageResponse(
						await HederaERC20__factory.connect(
							coin.coin.evmProxyAddress ?? '',
							this.signerOrProvider,
						).freeze(targetId),
					);
					break;
				case Decision.HTS:
					if (!coin.coin.tokenId)
						throw new Error(
							`StableCoin ${coin.coin.name}  does not have an underlying token`,
						);
					throw Error('Not be implemented');
					break;
				default:
					const tokenId = coin.coin.tokenId
						? coin.coin.tokenId.value
						: '';
					const OperationNotAllowed = new CapabilityError(
						this.getAccount(),
						Operation.FREEZE,
						tokenId,
					);
					return new TransactionResponse(
						undefined,
						undefined,
						OperationNotAllowed,
					);
					break;
			}
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async unfreeze(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse> {
		try {
			switch (CapabilityDecider.decide(coin, Operation.UNFREEZE)) {
				case Decision.CONTRACT:
					if (!coin.coin.evmProxyAddress)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have a proxy Address`,
						);

					return RPCTransactionResponseAdapter.manageResponse(
						await HederaERC20__factory.connect(
							coin.coin.evmProxyAddress ?? '',
							this.signerOrProvider,
						).unfreeze(targetId),
					);
					break;
				case Decision.HTS:
					if (!coin.coin.tokenId)
						throw new Error(
							`StableCoin ${coin.coin.name}  does not have an underlying token`,
						);
					throw Error('Not be implemented');
					break;
				default:
					const tokenId = coin.coin.tokenId
						? coin.coin.tokenId.value
						: '';
					const OperationNotAllowed = new CapabilityError(
						this.getAccount(),
						Operation.UNFREEZE,
						tokenId,
					);
					return new TransactionResponse(
						undefined,
						undefined,
						OperationNotAllowed,
					);
					break;
			}
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async pause(coin: StableCoinCapabilities): Promise<TransactionResponse> {
		try {
			switch (CapabilityDecider.decide(coin, Operation.PAUSE)) {
				case Decision.CONTRACT:
					if (!coin.coin.evmProxyAddress)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have a proxy Address`,
						);

					return RPCTransactionResponseAdapter.manageResponse(
						await HederaERC20__factory.connect(
							coin.coin.evmProxyAddress ?? '',
							this.signerOrProvider,
						).pause(),
					);
					break;
				case Decision.HTS:
					if (!coin.coin.tokenId)
						throw new Error(
							`StableCoin ${coin.coin.name}  does not have an underlying token`,
						);
					throw Error('Not be implemented');
					break;
				default:
					const tokenId = coin.coin.tokenId
						? coin.coin.tokenId.value
						: '';
					const OperationNotAllowed = new CapabilityError(
						this.getAccount(),
						Operation.PAUSE,
						tokenId,
					);
					return new TransactionResponse(
						undefined,
						undefined,
						OperationNotAllowed,
					);
					break;
			}
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async unpause(coin: StableCoinCapabilities): Promise<TransactionResponse> {
		try {
			switch (CapabilityDecider.decide(coin, Operation.UNPAUSE)) {
				case Decision.CONTRACT:
					if (!coin.coin.evmProxyAddress)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have a proxy Address`,
						);

					return RPCTransactionResponseAdapter.manageResponse(
						await HederaERC20__factory.connect(
							coin.coin.evmProxyAddress ?? '',
							this.signerOrProvider,
						).unpause(),
					);
					break;
				case Decision.HTS:
					if (!coin.coin.tokenId)
						throw new Error(
							`StableCoin ${coin.coin.name}  does not have an underlying token`,
						);
					throw Error('Not be implemented');
					break;
				default:
					const tokenId = coin.coin.tokenId
						? coin.coin.tokenId.value
						: '';
					const OperationNotAllowed = new CapabilityError(
						this.getAccount(),
						Operation.UNPAUSE,
						tokenId,
					);
					return new TransactionResponse(
						undefined,
						undefined,
						OperationNotAllowed,
					);
					break;
			}
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async rescue(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		try {
			switch (CapabilityDecider.decide(coin, Operation.RESCUE)) {
				case Decision.CONTRACT:
					if (!coin.coin.evmProxyAddress)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have a proxy Address`,
						);

					return RPCTransactionResponseAdapter.manageResponse(
						await HederaERC20__factory.connect(
							coin.coin.evmProxyAddress ?? '',
							this.signerOrProvider,
						).rescue(amount.toBigNumber()),
					);
					break;

				case Decision.HTS:
					throw Error(
						'RESCUE operation CANNOT be performed through HTS...',
					);
					break;
				default:
					const tokenId = coin.coin.tokenId
						? coin.coin.tokenId.value
						: '';
					const OperationNotAllowed = new CapabilityError(
						this.getAccount(),
						Operation.RESCUE,
						tokenId,
					);
					return new TransactionResponse(
						undefined,
						undefined,
						OperationNotAllowed,
					);
					break;
			}
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async delete(coin: StableCoinCapabilities): Promise<TransactionResponse> {
		try {
			switch (CapabilityDecider.decide(coin, Operation.DELETE)) {
				case Decision.CONTRACT:
					if (!coin.coin.evmProxyAddress)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have a proxy Address`,
						);

					return RPCTransactionResponseAdapter.manageResponse(
						await HederaERC20__factory.connect(
							coin.coin.evmProxyAddress ?? '',
							this.signerOrProvider,
						).deleteToken(),
					);
					break;

				case Decision.HTS:
					if (!coin.coin.tokenId)
						throw new Error(
							`StableCoin ${coin.coin.name}  does not have an underlying token`,
						);
					throw Error('Not be implemented');
					break;
				default:
					const tokenId = coin.coin.tokenId
						? coin.coin.tokenId.value
						: '';
					const OperationNotAllowed = new CapabilityError(
						this.getAccount(),
						Operation.DELETE,
						tokenId,
					);
					return new TransactionResponse(
						undefined,
						undefined,
						OperationNotAllowed,
					);
					break;
			}
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async contractCall(
		evmProxyAddress: string,
		functionName: string,
		param: unknown[],
	): Promise<ContractTransaction> {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore todo
		return await IHederaTokenService__factory.connect(
			evmProxyAddress,
			this.signerOrProvider,
		)[functionName](...param);
		// throw new Error('Method not implemented.');
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
	async precompiledCall(
		functionName: string,
		param: unknown[],
	): Promise<ContractTransaction> {
		const precompiledAddress = '0000000000000000000000000000000000000167';
		return await this.contractCall(precompiledAddress, functionName, param);
	}
}
