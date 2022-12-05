/* eslint-disable no-case-declarations */
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import {
	HederaERC20__factory,
	IHederaTokenService__factory,
} from 'hedera-stable-coin-contracts/typechain-types/index.js';
import TransactionAdapter from '../TransactionAdapter';
import { ContractTransaction, ethers, Signer } from 'ethers';
import { singleton } from 'tsyringe';
import StableCoinCapabilities from '../../../domain/context/stablecoin/StableCoinCapabilities.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';
import { Injectable } from '../../../core/Injectable.js';
import { RPCTransactionResponseAdapter } from './RPCTransactionRespondeAdapter.js';
import type { Provider } from '@ethersproject/providers';
import { CapabilityDecider, Decision } from '../CapabilityDecider.js';
import { Operation } from '../../../domain/context/stablecoin/Capability.js';
import { CapabilityError } from '../hs/error/CapabilityError.js';
import { CallableContract } from '../../../core/Cast.js';
import { TokenId } from '@hashgraph/sdk';
import { StableCoinRole } from '../../../domain/context/stablecoin/StableCoinRole.js';
import detectEthereumProvider from '@metamask/detect-provider';

// eslint-disable-next-line no-var
declare var ethereum: any;

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
							coin.coin.evmProxyAddress,
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
							coin.coin.evmProxyAddress,
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
							TokenId.fromString(
								coin.coin.tokenId.value,
							).toSolidityAddress(),
							amount,
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
			console.log(error);

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
							coin.coin.evmProxyAddress,
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
							coin.coin.evmProxyAddress,
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
							coin.coin.evmProxyAddress,
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
							coin.coin.evmProxyAddress,
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
							coin.coin.evmProxyAddress,
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
							coin.coin.evmProxyAddress,
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
							coin.coin.evmProxyAddress,
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
	async grantRole(
		coin: StableCoinCapabilities,
		targetId: string,
		role: StableCoinRole,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress)
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy Address`,
				);

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaERC20__factory.connect(
					coin.coin.evmProxyAddress,
					this.signerOrProvider,
				).grantRole(role, targetId),
			);
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async revokeRole(
		coin: StableCoinCapabilities,
		targetId: string,
		role: StableCoinRole,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress)
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy Address`,
				);

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaERC20__factory.connect(
					coin.coin.evmProxyAddress,
					this.signerOrProvider,
				).revokeRole(role, targetId),
			);
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async grantSupplierRole(
		coin: StableCoinCapabilities,
		targetId: string,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress)
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy Address`,
				);

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaERC20__factory.connect(
					coin.coin.evmProxyAddress,
					this.signerOrProvider,
				).grantSupplierRole(targetId, amount.toBigNumber()),
			);
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async grantUnlimitedSupplierRole(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress)
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy Address`,
				);

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaERC20__factory.connect(
					coin.coin.evmProxyAddress,
					this.signerOrProvider,
				).grantUnlimitedSupplierRole(targetId),
			);
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async revokeSupplierRole(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress)
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy Address`,
				);

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaERC20__factory.connect(
					coin.coin.evmProxyAddress,
					this.signerOrProvider,
				).revokeSupplierRole(targetId),
			);
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async hasRole(
		coin: StableCoinCapabilities,
		targetId: string,
		role: StableCoinRole,
	): Promise<TransactionResponse<boolean, Error>> {
		try {
			if (!coin.coin.evmProxyAddress)
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy Address`,
				);

			return new TransactionResponse(
				undefined,
				await HederaERC20__factory.connect(
					coin.coin.evmProxyAddress,
					this.signerOrProvider,
				).hasRole(role, targetId),
			);
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async getBalanceOf(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse<BigDecimal, Error>> {
		try {
			if (!coin.coin.evmProxyAddress)
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy Address`,
				);
			const res = await HederaERC20__factory.connect(
				coin.coin.evmProxyAddress,
				this.signerOrProvider,
			).balanceOf(targetId);

			return new TransactionResponse(
				undefined,
				BigDecimal.fromStringFixed(res.toString(), coin.coin.decimals),
			);
		} catch (error) {
			// should throw RPCHandlerError
			console.log(error);

			throw new Error('Error');
		}
	}
	async associateToken(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress)
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy Address`,
				);

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaERC20__factory.connect(
					coin.coin.evmProxyAddress,
					this.signerOrProvider,
				).associateToken(targetId),
			);
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async isUnlimitedSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress)
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy Address`,
				);

			return new TransactionResponse(
				undefined,
				await HederaERC20__factory.connect(
					coin.coin.evmProxyAddress,
					this.signerOrProvider,
				).isUnlimitedSupplierAllowance(targetId),
			);
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async supplierAllowance(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse<BigDecimal, Error>> {
		try {
			if (!coin.coin.evmProxyAddress)
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy Address`,
				);

			const res = await HederaERC20__factory.connect(
				coin.coin.evmProxyAddress,
				this.signerOrProvider,
			).supplierAllowance(targetId);

			return new TransactionResponse(
				undefined,
				BigDecimal.fromStringFixed(res.toString(), coin.coin.decimals),
			);
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async resetSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress)
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy Address`,
				);

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaERC20__factory.connect(
					coin.coin.evmProxyAddress,
					this.signerOrProvider,
				).resetSupplierAllowance(targetId),
			);
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async increaseSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: string,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress)
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy Address`,
				);

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaERC20__factory.connect(
					coin.coin.evmProxyAddress,
					this.signerOrProvider,
				).increaseSupplierAllowance(targetId, amount.toBigNumber()),
			);
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async decreaseSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: string,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress)
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy Address`,
				);

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaERC20__factory.connect(
					coin.coin.evmProxyAddress,
					this.signerOrProvider,
				).decreaseSupplierAllowance(targetId, amount.toBigNumber()),
			);
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async getRoles(
		coin: StableCoinCapabilities,
		targetId: string,
	): Promise<TransactionResponse<string[], Error>> {
		try {
			if (!coin.coin.evmProxyAddress)
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy Address`,
				);

			return new TransactionResponse(
				undefined,
				await HederaERC20__factory.connect(
					coin.coin.evmProxyAddress,
					this.signerOrProvider,
				).getRoles(targetId),
			);
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async contractCall(
		contractAddress: string,
		functionName: string,
		param: unknown[],
	): Promise<ContractTransaction> {
		const erc20: CallableContract = IHederaTokenService__factory.connect(
			contractAddress,
			this.signerOrProvider,
		).functions;
		return erc20[functionName](...param);
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

	/**
	 * TODO consider leaving this as a service and putting two implementations on top for rpc and web wallet.
	 */

	async connectMetamask(): Promise<void> {
		const ethProvider = await detectEthereumProvider();

		if (ethProvider) {
			console.log('Ethereum successfully detected!');

			if (ethProvider.isMetaMask) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				this.signerOrProvider = provider.getSigner();
			} else {
				console.error('You have found!', Error);
			}
		} else {
			console.error('Manage metaMask not found!', Error);
		}
	}
}
