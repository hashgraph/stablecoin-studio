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
import { lazyInject } from '../../../core/decorator/LazyInjectDecorator.js';
import { MirrorNodeAdapter } from '../mirror/MirrorNodeAdapter.js';
import NetworkService from '../../../app/service/NetworkService.js';

// eslint-disable-next-line no-var
declare var ethereum: any;

@singleton()
export default class RPCTransactionAdapter extends TransactionAdapter {
	provider: ethers.providers.JsonRpcProvider;
	account: Account;
	signerOrProvider: Signer | Provider;

	constructor(
		@lazyInject(MirrorNodeAdapter)
		private readonly mirrorNodeAdapter: MirrorNodeAdapter,
		@lazyInject(NetworkService)
		private readonly networkService: NetworkService,
	) {
		super();
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

	getMirrorNodeAdapter(): MirrorNodeAdapter {
		return this.mirrorNodeAdapter;
	}

	async wipe(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: await this.accountToEvmAddress(targetId),
			amount: amount
		});	
		return this.performOperation(coin, Operation.WIPE, params);
	}

	async cashin(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: await this.accountToEvmAddress(targetId),
			amount: amount
		});
		return this.performOperation(coin, Operation.CASH_IN, params);
	}

	async burn(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		const params = new Params({
			amount: amount
		});
		return this.performOperation(coin, Operation.BURN, params);		
	}

	async freeze(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: await this.accountToEvmAddress(targetId)
		});
		return this.performOperation(coin, Operation.FREEZE, params);		
	}
	 
	async unfreeze(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: await this.accountToEvmAddress(targetId)
		});
		return this.performOperation(coin, Operation.UNFREEZE, params);		
	}

	async pause(coin: StableCoinCapabilities): Promise<TransactionResponse> {
		return this.performOperation(coin, Operation.PAUSE);		
	}

	async unpause(coin: StableCoinCapabilities): Promise<TransactionResponse> {
		return this.performOperation(coin, Operation.UNPAUSE);		
	}

	async rescue(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		const params = new Params({
			amount: amount
		});
		return this.performOperation(coin, Operation.RESCUE, params);
	}

	async delete(coin: StableCoinCapabilities): Promise<TransactionResponse> {
		return this.performOperation(coin, Operation.DELETE);		
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
				).grantRole(role, this.accountToEvmAddress(targetId)),
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
				).revokeRole(role, this.accountToEvmAddress(targetId)),
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
					this.accountToEvmAddress(targetId),
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
					this.accountToEvmAddress(targetId),
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
				).revokeSupplierRole(this.accountToEvmAddress(targetId)),
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
				).hasRole(role, this.accountToEvmAddress(targetId)),
			);
		} catch (error) {
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
			).balanceOf(this.accountToEvmAddress(targetId));

			return new TransactionResponse(
				undefined,
				BigDecimal.fromStringFixed(res.toString(), coin.coin.decimals),
			);
		} catch (error) {
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
				).associateToken(this.accountToEvmAddress(targetId)),
			);
		} catch (error) {
			throw new Error('Error');
		}
	}

	async dissociateToken(
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
				).dissociateToken(this.accountToEvmAddress(targetId)),
			);
		} catch (error) {
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
					this.accountToEvmAddress(targetId),
				),
			);
		} catch (error) {
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
			).supplierAllowance(this.accountToEvmAddress(targetId));

			return new TransactionResponse(
				undefined,
				BigDecimal.fromStringFixed(res.toString(), coin.coin.decimals),
			);
		} catch (error) {
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
				).resetSupplierAllowance(this.accountToEvmAddress(targetId)),
			);
		} catch (error) {
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
					this.accountToEvmAddress(targetId),
					amount.toBigNumber(),
				),
			);
		} catch (error) {
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
					this.accountToEvmAddress(targetId),
					amount.toBigNumber(),
				),
			);
		} catch (error) {
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
				).getRoles(this.accountToEvmAddress(targetId)),
			);
		} catch (error) {
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

	async performOperation(
		coin: StableCoinCapabilities,
		operation: Operation,
		params?: Params
	): Promise<TransactionResponse> {
		try {
			switch (CapabilityDecider.decide(coin, operation)) {
				case Decision.CONTRACT:
					if (!coin.coin.evmProxyAddress)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have a proxy Address`,
						);
					return this.performSmartContractOperation(coin, operation, params);						

				case Decision.HTS:
					if (!coin.coin.evmProxyAddress)
						throw new Error(
							`StableCoin ${coin.coin.name} does not have a proxy Address`,
						);
					if (!coin.coin.tokenId)
						throw new Error(
							`StableCoin ${coin.coin.name}  does not have an underlying token`,
						);

					return this.performHTSOperation(coin, operation, params);				

				default:
					const tokenId = coin.coin.tokenId ? coin.coin.tokenId.value : '';
					const OperationNotAllowed = new CapabilityError(this.getAccount().id.value, operation, tokenId);
					return new TransactionResponse(undefined, undefined, OperationNotAllowed);
			}
		} catch (error) {
			// should throw RPCHandlerError
			throw new Error(
				`Unexpected error in RPCTransactionHandler ${operation} operation : ${error}`,
			);
		}
	}

	private async performSmartContractOperation(coin: StableCoinCapabilities,
		operation: Operation,
		params?: Params									  
		): Promise<TransactionResponse> 
	{
		switch(operation) {
			case Operation.CASH_IN:
				return RPCTransactionResponseAdapter.manageResponse(await HederaERC20__factory.connect(coin.coin.evmProxyAddress!, this.signerOrProvider).mint(params!.targetId!, params!.amount!.toBigNumber()));

			case Operation.BURN:
				return RPCTransactionResponseAdapter.manageResponse(await HederaERC20__factory.connect(coin.coin.evmProxyAddress!, this.signerOrProvider).burn(params!.amount!.toBigNumber()));

			case Operation.WIPE:
				return RPCTransactionResponseAdapter.manageResponse(await HederaERC20__factory.connect(coin.coin.evmProxyAddress!, this.signerOrProvider).wipe(params!.targetId!, params!.amount!.toBigNumber()));

			case Operation.RESCUE:
				return RPCTransactionResponseAdapter.manageResponse(await HederaERC20__factory.connect(coin.coin.evmProxyAddress!, this.signerOrProvider).rescue(params!.amount!.toBigNumber()));
	
			case Operation.FREEZE:
				return RPCTransactionResponseAdapter.manageResponse(await HederaERC20__factory.connect(coin.coin.evmProxyAddress!, this.signerOrProvider).freeze(params!.targetId!));

			case Operation.UNFREEZE:
				return RPCTransactionResponseAdapter.manageResponse(await HederaERC20__factory.connect(coin.coin.evmProxyAddress!, this.signerOrProvider).unfreeze(params!.targetId!));

			case Operation.PAUSE:
				return RPCTransactionResponseAdapter.manageResponse(await HederaERC20__factory.connect(coin.coin.evmProxyAddress!, this.signerOrProvider).pause());

			case Operation.UNPAUSE:
				return RPCTransactionResponseAdapter.manageResponse(await HederaERC20__factory.connect(coin.coin.evmProxyAddress!, this.signerOrProvider).unpause());

			case Operation.DELETE:
				return RPCTransactionResponseAdapter.manageResponse(await HederaERC20__factory.connect(coin.coin.evmProxyAddress!, this.signerOrProvider).deleteToken());
	
			default:
				throw new Error(`Operation not implemented through Smart Contracts`);
		}
	}

	private async performHTSOperation(
		coin: StableCoinCapabilities,
		operation: Operation,
		params?: Params,
	): Promise<TransactionResponse> {
		switch (operation) {
			case Operation.CASH_IN:
				return RPCTransactionResponseAdapter.manageResponse(
					await this.precompiledCall('mintToken', [
						TokenId.fromString(
							coin.coin.tokenId?.value!,
						).toSolidityAddress(),
						params?.amount,
						[],
					]),
				);

			case Operation.BURN:
				return RPCTransactionResponseAdapter.manageResponse(
					await this.precompiledCall('burnToken', [
						TokenId.fromString(
							coin.coin.tokenId?.value!,
						).toSolidityAddress(),
						params?.amount,
						[],
					]),
				);

			case Operation.WIPE:
				return RPCTransactionResponseAdapter.manageResponse(
					await this.precompiledCall('wipeTokenAccount', [
						TokenId.fromString(
							coin.coin.tokenId?.value!,
						).toSolidityAddress(),
						params?.targetId,
						params?.amount
					]),
				);

			case Operation.FREEZE:
				return RPCTransactionResponseAdapter.manageResponse(
					await this.precompiledCall('freezeToken', [
						TokenId.fromString(
							coin.coin.tokenId?.value!,
						).toSolidityAddress(),
						params?.targetId
					]),
				);

			case Operation.UNFREEZE:
				return RPCTransactionResponseAdapter.manageResponse(
					await this.precompiledCall('unfreezeToken', [
						TokenId.fromString(
							coin.coin.tokenId?.value!,
						).toSolidityAddress(),
						params?.targetId
					]),
				);

			case Operation.PAUSE:
				return RPCTransactionResponseAdapter.manageResponse(
					await this.precompiledCall('pauseToken', [
						TokenId.fromString(
							coin.coin.tokenId?.value!,
						).toSolidityAddress()
					]),
				);

			case Operation.UNPAUSE:
				return RPCTransactionResponseAdapter.manageResponse(
					await this.precompiledCall('unpauseToken', [
						TokenId.fromString(
							coin.coin.tokenId?.value!,
						).toSolidityAddress()
					]),
				);

			case Operation.DELETE:
				return RPCTransactionResponseAdapter.manageResponse(
					await this.precompiledCall('deleteToken', [
						TokenId.fromString(
							coin.coin.tokenId?.value!,
						).toSolidityAddress()
					]),
				);

			default:
				throw new Error(`Operation not implemented through HTS`);
		}
	}
}

class Params{
	role?: string;
	targetId?: string;
	amount?: BigDecimal;

	constructor({ role, targetId, amount }: { role?: string, targetId?: string, amount?: BigDecimal }) {
		this.role = role;
		this.targetId = targetId;
		this.amount = amount;
	}
}
