/* eslint-disable no-case-declarations */
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import {
	HederaERC20__factory,
	IHederaTokenService__factory,
} from 'hedera-stable-coin-contracts/typechain-types/index.js';
import TransactionAdapter, {
	TransactionAdapterInitializationData,
} from '../TransactionAdapter';
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
import { RuntimeError } from '../../../core/error/RuntimeError.js';
import Account from '../../../domain/context/account/Account.js';
import { HederaId } from '../../../domain/context/shared/HederaId.js';
import AccountViewModel from '../mirror/response/AccountViewModel.js';
import { lazyInject } from '../../../core/decorator/LazyInjectDecorator.js';
import { MirrorNodeAdapter } from '../mirror/MirrorNodeAdapter.js';
import NetworkService from '../../../app/service/NetworkService.js';
import ContractId from '../../../domain/context/contract/ContractId.js';
import { StableCoin } from '../../../domain/context/stablecoin/StableCoin.js';

// eslint-disable-next-line no-var
declare var ethereum: any;

@singleton()
export default class RPCTransactionAdapter implements TransactionAdapter {
	provider: ethers.providers.JsonRpcProvider;
	account: Account;
	signerOrProvider: Signer | Provider;

	constructor(
		@lazyInject(MirrorNodeAdapter)
		private readonly mirrorNode: MirrorNodeAdapter,
		@lazyInject(NetworkService)
		private readonly networkService: NetworkService,
	) {}
	create(coin: StableCoin, factory: ContractId, hederaERC20: ContractId): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}

	async register(
		account: Account,
		debug = false,
	): Promise<TransactionAdapterInitializationData> {
		this.account = account;
		this.provider = new ethers.providers.JsonRpcProvider(
			`https://${this.networkService.environment.toString()}.hashio.io/api`,
		);
		!debug && this.connectMetamask();
		Injectable.registerTransactionHandler(this);
		return Promise.resolve({ account });
	}

	stop(): Promise<boolean> {
		return Promise.resolve(true);
	}

	async wipe(
		coin: StableCoinCapabilities,
		targetId: HederaId,
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
						).mint(
							this.getAccountEvmAddress(targetId),
							amount.toBigNumber(),
						),
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
						(await this.getAccount()).id?.value ?? '',
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
		targetId: HederaId,
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
						).mint(
							this.getAccountEvmAddress(targetId),
							amount.toBigNumber(),
						),
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
						(await this.getAccount()).id?.value ?? '',
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
						(await this.getAccount()).id?.value ?? '',
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
		targetId: HederaId,
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
						).freeze(this.getAccountEvmAddress(targetId)),
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
						(await this.getAccount()).id?.value ?? '',
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
		targetId: HederaId,
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
						).unfreeze(this.getAccountEvmAddress(targetId)),
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
						(await this.getAccount()).id?.value ?? '',
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
						(await this.getAccount()).id?.value ?? '',
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
						(await this.getAccount()).id?.value ?? '',
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

				case Decision.HTS:
					throw Error(
						'RESCUE operation CANNOT be performed through HTS...',
					);
				default:
					const tokenId = coin.coin.tokenId
						? coin.coin.tokenId.value
						: '';
					const OperationNotAllowed = new CapabilityError(
						(await this.getAccount()).id?.value ?? '',
						Operation.RESCUE,
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
						(await this.getAccount()).id?.value ?? '',
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
		targetId: HederaId,
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
				).grantRole(role, this.getAccountEvmAddress(targetId)),
			);
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async revokeRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
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
				).revokeRole(role, this.getAccountEvmAddress(targetId)),
			);
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async grantSupplierRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
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
				).grantSupplierRole(
					this.getAccountEvmAddress(targetId),
					amount.toBigNumber(),
				),
			);
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async grantUnlimitedSupplierRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
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
				).grantUnlimitedSupplierRole(
					this.getAccountEvmAddress(targetId),
				),
			);
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async revokeSupplierRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
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
				).revokeSupplierRole(this.getAccountEvmAddress(targetId)),
			);
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async hasRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
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
				).hasRole(role, this.getAccountEvmAddress(targetId)),
			);
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}

	async balanceOf(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<BigDecimal, Error>> {
		try {
			if (!coin.coin.evmProxyAddress)
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy Address`,
				);
			const res = await HederaERC20__factory.connect(
				coin.coin.evmProxyAddress,
				this.signerOrProvider,
			).balanceOf(this.getAccountEvmAddress(targetId));

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
		targetId: HederaId,
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
				).associateToken(this.getAccountEvmAddress(targetId)),
			);
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async isUnlimitedSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
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
				).isUnlimitedSupplierAllowance(
					this.getAccountEvmAddress(targetId),
				),
			);
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async supplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<BigDecimal, Error>> {
		try {
			if (!coin.coin.evmProxyAddress)
				throw new Error(
					`StableCoin ${coin.coin.name} does not have a proxy Address`,
				);

			const res = await HederaERC20__factory.connect(
				coin.coin.evmProxyAddress,
				this.signerOrProvider,
			).supplierAllowance(this.getAccountEvmAddress(targetId));

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
		targetId: HederaId,
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
				).resetSupplierAllowance(this.getAccountEvmAddress(targetId)),
			);
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async increaseSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
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
				).increaseSupplierAllowance(
					this.getAccountEvmAddress(targetId),
					amount.toBigNumber(),
				),
			);
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async decreaseSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
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
				).decreaseSupplierAllowance(
					this.getAccountEvmAddress(targetId),
					amount.toBigNumber(),
				),
			);
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error('Error');
		}
	}
	async getRoles(
		coin: StableCoinCapabilities,
		targetId: HederaId,
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
				).getRoles(this.getAccountEvmAddress(targetId)),
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
		sourceId: Account,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	async signAndSendTransaction(
		t: RPCTransactionAdapter,
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	getAccount(): Account {
		return this.account;
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
		try {
			const ethProvider = await detectEthereumProvider();
			if (ethProvider) {
				console.log('Ethereum successfully detected!');

				if (ethProvider.isMetaMask) {
					const provider = new ethers.providers.Web3Provider(
						ethereum,
					);
					this.signerOrProvider = provider.getSigner();
				} else {
					console.error('You have found!', Error);
				}
			} else {
				console.error('Manage metaMask not found!', Error);
			}
		} catch (error) {
			throw new RuntimeError((error as Error).message);
		}
	}

	private async getAccountEvmAddress(accountId: HederaId): Promise<string> {
		try {
			const accountInfoViewModel: AccountViewModel =
				await this.mirrorNode.getAccountInfo(accountId);
			if (accountInfoViewModel.accountEvmAddress) {
				return accountInfoViewModel.accountEvmAddress;
			} else if (accountInfoViewModel.account) {
				return HederaId.from(accountInfoViewModel.account)
					.toHederaAddress()
					.toSolidityAddress();
			} else {
				return Promise.reject<string>('');
			}
		} catch (error) {
			return Promise.reject<string>(error);
		}
	}
}
