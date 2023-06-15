/*
 *
 * Hedera Stable Coin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import { ContractId as HContractId } from '@hashgraph/sdk';
import {
	HederaTokenManager__factory,
	HederaReserve__factory,
	StableCoinFactory__factory,
	IHederaTokenService__factory,
	ProxyAdmin__factory,
} from '@hashgraph-dev/stablecoin-npm-contracts';
import TransactionAdapter, { InitializationData } from '../TransactionAdapter';
import { BigNumber, ContractTransaction, ethers, Signer } from 'ethers';
import { singleton } from 'tsyringe';
import StableCoinCapabilities from '../../../domain/context/stablecoin/StableCoinCapabilities.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';
import Injectable from '../../../core/Injectable.js';
import type { Provider } from '@ethersproject/providers';
import { CapabilityDecider, Decision } from '../CapabilityDecider.js';
import { Operation } from '../../../domain/context/stablecoin/Capability.js';
import { CapabilityError } from '../hs/error/CapabilityError.js';
import { CallableContract } from '../../../core/Cast.js';
import { StableCoinRole } from '../../../domain/context/stablecoin/StableCoinRole.js';
import detectEthereumProvider from '@metamask/detect-provider';
import { RuntimeError } from '../../../core/error/RuntimeError.js';
import Account from '../../../domain/context/account/Account.js';
import { HederaId } from '../../../domain/context/shared/HederaId.js';
import { lazyInject } from '../../../core/decorator/LazyInjectDecorator.js';
import { MirrorNodeAdapter } from '../mirror/MirrorNodeAdapter.js';
import NetworkService from '../../../app/service/NetworkService.js';
import ContractId from '../../../domain/context/contract/ContractId.js';
import { StableCoinProps } from '../../../domain/context/stablecoin/StableCoin.js';
import { TokenSupplyType } from '../../../domain/context/stablecoin/TokenSupply.js';
import { FactoryStableCoin } from '../../../domain/context/factory/FactoryStableCoin.js';
import { FactoryKey } from '../../../domain/context/factory/FactoryKey.js';
import PublicKey from '../../../domain/context/account/PublicKey.js';
import {
	BURN_GAS,
	CASHIN_GAS,
	CHANGE_PROXY_OWNER,
	CREATE_SC_GAS,
	DECREASE_SUPPLY_GAS,
	DELETE_GAS,
	FREEZE_GAS,
	GRANT_KYC_GAS,
	GRANT_ROLES_GAS,
	INCREASE_SUPPLY_GAS,
	MAX_ROLES_GAS,
	PAUSE_GAS,
	RESCUE_GAS,
	RESCUE_HBAR_GAS,
	RESET_SUPPLY_GAS,
	REVOKE_KYC_GAS,
	REVOKE_ROLES_GAS,
	TOKEN_CREATION_COST_HBAR,
	UNFREEZE_GAS,
	UNPAUSE_GAS,
	UPDATE_PROXY_IMPLEMENTATION,
	UPDATE_RESERVE_ADDRESS_GAS,
	UPDATE_RESERVE_AMOUNT_GAS,
	UPDATE_TOKEN_GAS,
	WIPE_GAS,
} from '../../../core/Constants.js';
import { MetaMaskInpageProvider } from '@metamask/providers';
import { WalletConnectError } from '../../../domain/context/network/error/WalletConnectError.js';
import EventService from '../../../app/service/event/EventService.js';
import {
	ConnectionState,
	WalletEvents,
} from '../../../app/service/event/WalletEvent.js';
import { SupportedWallets } from '../../../domain/context/network/Wallet.js';
import { RPCTransactionResponseAdapter } from './RPCTransactionResponseAdapter.js';
import LogService from '../../../app/service/LogService.js';
import { WalletConnectRejectedError } from '../../../domain/context/network/error/WalletConnectRejectedError.js';
import { TransactionResponseError } from '../error/TransactionResponseError.js';
import { SigningError } from '../hs/error/SigningError.js';
import { RESERVE_DECIMALS } from '../../../domain/context/reserve/Reserve.js';
import { FactoryRole } from '../../../domain/context/factory/FactoryRole.js';
import { FactoryCashinRole } from '../../../domain/context/factory/FactoryCashinRole.js';
import {
	HederaNetworks,
	unrecognized,
} from '../../../domain/context/network/Environment.js';
import { CommandBus } from '../../../core/command/CommandBus.js';
import { SetNetworkCommand } from '../../../app/usecase/command/network/setNetwork/SetNetworkCommand.js';
import { SetConfigurationCommand } from '../../../app/usecase/command/network/setConfiguration/SetConfigurationCommand.js';
import {
	EnvironmentMirrorNode,
	MirrorNode,
	MirrorNodes,
} from '../../../domain/context/network/MirrorNode.js';
import {
	EnvironmentJsonRpcRelay,
	JsonRpcRelay,
	JsonRpcRelays,
} from '../../../domain/context/network/JsonRpcRelay.js';
import {
	EnvironmentFactory,
	Factories,
} from '../../../domain/context/factory/Factories.js';

// eslint-disable-next-line no-var
declare var ethereum: MetaMaskInpageProvider;

@singleton()
export default class RPCTransactionAdapter extends TransactionAdapter {
	account: Account;
	signerOrProvider: Signer | Provider;
	mirrorNodes: MirrorNodes;
	jsonRpcRelays: JsonRpcRelays;
	factories: Factories;

	constructor(
		@lazyInject(MirrorNodeAdapter)
		private readonly mirrorNodeAdapter: MirrorNodeAdapter,
		@lazyInject(NetworkService)
		private readonly networkService: NetworkService,
		@lazyInject(EventService)
		private readonly eventService: EventService,
		@lazyInject(CommandBus)
		private readonly commandBus: CommandBus,
	) {
		super();
		this.registerMetamaskEvents();
	}

	public async create(
		coin: StableCoinProps,
		factory: ContractId,
		hederaTokenManager: ContractId,
		createReserve: boolean,
		reserveAddress?: ContractId,
		reserveInitialAmount?: BigDecimal,
	): Promise<TransactionResponse<any, Error>> {
		try {
			const cashinRole: FactoryCashinRole = {
				account:
					coin.cashInRoleAccount == undefined ||
					coin.cashInRoleAccount.toString() == '0.0.0'
						? '0x0000000000000000000000000000000000000000'
						: await this.getEVMAddress(coin.cashInRoleAccount),
				allowance: coin.cashInRoleAllowance
					? coin.cashInRoleAllowance.toFixedNumber()
					: BigDecimal.ZERO.toFixedNumber(),
			};

			const providedKeys = [
				coin.adminKey,
				coin.kycKey,
				coin.freezeKey,
				coin.wipeKey,
				coin.supplyKey,
				coin.feeScheduleKey,
				coin.pauseKey,
			];

			const keys: FactoryKey[] =
				this.setKeysForSmartContract(providedKeys);

			const providedRoles = [
				{
					account: coin.burnRoleAccount,
					role: StableCoinRole.BURN_ROLE,
				},
				{
					account: coin.wipeRoleAccount,
					role: StableCoinRole.WIPE_ROLE,
				},
				{
					account: coin.rescueRoleAccount,
					role: StableCoinRole.RESCUE_ROLE,
				},
				{
					account: coin.pauseRoleAccount,
					role: StableCoinRole.PAUSE_ROLE,
				},
				{
					account: coin.freezeRoleAccount,
					role: StableCoinRole.FREEZE_ROLE,
				},
				{
					account: coin.deleteRoleAccount,
					role: StableCoinRole.DELETE_ROLE,
				},
				{ account: coin.kycRoleAccount, role: StableCoinRole.KYC_ROLE },
			];

			const roles = await Promise.all(
				providedRoles
					.filter((item) => {
						return (
							item.account &&
							item.account.value !== HederaId.NULL.value
						);
					})
					.map(async (item) => {
						const role = new FactoryRole();
						role.role = item.role;
						role.account = await this.getEVMAddress(item.account!);
						return role;
					}),
			);

			const stableCoinToCreate = new FactoryStableCoin(
				coin.name,
				coin.symbol,
				coin.freezeDefault ?? false,
				coin.supplyType == TokenSupplyType.FINITE,
				coin.maxSupply
					? coin.maxSupply.toFixedNumber()
					: BigDecimal.ZERO.toFixedNumber(),
				coin.initialSupply
					? coin.initialSupply.toFixedNumber()
					: BigDecimal.ZERO.toFixedNumber(),
				coin.decimals,
				reserveAddress == undefined ||
				reserveAddress.toString() == '0.0.0'
					? '0x0000000000000000000000000000000000000000'
					: HContractId.fromString(
							reserveAddress.value,
					  ).toSolidityAddress(),
				reserveInitialAmount
					? reserveInitialAmount.toFixedNumber()
					: BigDecimal.ZERO.toFixedNumber(),
				createReserve,
				keys,
				roles,
				cashinRole,
				coin.metadata ?? '',
			);

			const factoryInstance = StableCoinFactory__factory.connect(
				'0x' +
					HContractId.fromString(factory.value).toSolidityAddress(),
				this.signerOrProvider,
			);
			LogService.logTrace('Deploying factory: ', {
				tokenManager: hederaTokenManager.value,
				stableCoin: stableCoinToCreate,
			});
			const res = await factoryInstance.deployStableCoin(
				stableCoinToCreate,
				'0x' +
					HContractId.fromString(
						hederaTokenManager.value,
					).toSolidityAddress(),
				{
					value: ethers.utils.parseEther(
						TOKEN_CREATION_COST_HBAR.toString(),
					),
					gasLimit: CREATE_SC_GAS,
				},
			);

			// Put it into an array since structs change the response from the event and its not a simple array
			return await RPCTransactionResponseAdapter.manageResponse(
				res,
				this.networkService.environment,
				'Deployed',
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(
				`Unexpected error in RPCTransactionAdapter create operation : ${error}`,
			);
		}
	}

	async init(debug = false): Promise<string> {
		!debug && (await this.connectMetamask(false));
		const eventData = {
			initData: {
				account: this.account,
				pairing: '',
				topic: '',
			},
			wallet: SupportedWallets.METAMASK,
		};
		this.eventService.emit(WalletEvents.walletInit, eventData);
		LogService.logTrace('Metamask Initialized ', eventData);

		return this.networkService.environment;
	}

	public setMirrorNodes(mirrorNodes?: MirrorNodes): void {
		if (mirrorNodes) this.mirrorNodes = mirrorNodes;
	}

	public setJsonRpcRelays(jsonRpcRelays?: JsonRpcRelays): void {
		if (jsonRpcRelays) this.jsonRpcRelays = jsonRpcRelays;
	}

	public setFactories(factories?: Factories): void {
		if (factories) this.factories = factories;
	}

	async register(
		account?: Account,
		debug = false,
	): Promise<InitializationData> {
		if (account) {
			const accountMirror = await this.mirrorNodeAdapter.getAccountInfo(
				account.id,
			);
			this.account = account;
			this.account.publicKey = accountMirror.publicKey;
		}
		Injectable.registerTransactionHandler(this);
		!debug && (await this.connectMetamask());
		LogService.logTrace('Metamask registered as handler');
		return Promise.resolve({ account });
	}

	stop(): Promise<boolean> {
		this.eventService.emit(WalletEvents.walletConnectionStatusChanged, {
			status: ConnectionState.Disconnected,
			wallet: SupportedWallets.METAMASK,
		});
		LogService.logTrace('Metamask stopped');
		this.eventService.emit(WalletEvents.walletDisconnect, {
			wallet: SupportedWallets.METAMASK,
		});
		return Promise.resolve(true);
	}

	getMirrorNodeAdapter(): MirrorNodeAdapter {
		return this.mirrorNodeAdapter;
	}

	public async update(
		coin: StableCoinCapabilities,
		name: string | undefined,
		symbol: string | undefined,
		autoRenewPeriod: number | undefined,
		expirationTime: number | undefined,
		kycKey: PublicKey | undefined,
		freezeKey: PublicKey | undefined,
		feeScheduleKey: PublicKey | undefined,
		pauseKey: PublicKey | undefined,
		wipeKey: PublicKey | undefined,
		metadata: string | undefined,
	): Promise<TransactionResponse<any, Error>> {
		const params = new Params({
			name: name,
			symbol: symbol,
			autoRenewPeriod: autoRenewPeriod,
			expirationTime: expirationTime,
			kycKey: kycKey,
			freezeKey: freezeKey,
			feeScheduleKey: feeScheduleKey,
			pauseKey: pauseKey,
			wipeKey: wipeKey,
			metadata: metadata,
		});
		return this.performOperation(coin, Operation.UPDATE, params);
	}

	async wipe(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: await this.getEVMAddress(targetId),
			amount: amount,
		});
		return this.performOperation(coin, Operation.WIPE, params);
	}

	async cashin(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: targetId.toString(),
			amount: amount,
		});
		return this.performOperation(coin, Operation.CASH_IN, params);
	}

	async burn(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		const params = new Params({
			amount: amount,
		});
		return this.performOperation(coin, Operation.BURN, params);
	}

	async freeze(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: await this.getEVMAddress(targetId),
		});
		return this.performOperation(coin, Operation.FREEZE, params);
	}

	async unfreeze(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		const params = new Params({
			targetId: await this.getEVMAddress(targetId),
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
			amount: amount,
		});
		return this.performOperation(coin, Operation.RESCUE, params);
	}

	async rescueHBAR(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		const params = new Params({
			amount: amount,
		});
		return this.performOperation(coin, Operation.RESCUE_HBAR, params);
	}

	async delete(coin: StableCoinCapabilities): Promise<TransactionResponse> {
		return this.performOperation(coin, Operation.DELETE);
	}

	public async getReserveAddress(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					network: this.networkService.environment,
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			const res = await HederaTokenManager__factory.connect(
				coin.coin.evmProxyAddress?.toString(),
				this.signerOrProvider,
			).getReserveAddress();

			return new TransactionResponse(undefined, res.toString());
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				network: this.networkService.environment,
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter update reserve operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	public async updateReserveAddress(
		coin: StableCoinCapabilities,
		reserveAddress: ContractId,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					network: this.networkService.environment,
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaTokenManager__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).updateReserveAddress(
					reserveAddress.toHederaAddress().toSolidityAddress(),
					{ gasLimit: UPDATE_RESERVE_ADDRESS_GAS },
				),
				this.networkService.environment,
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				network: this.networkService.environment,
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter update reserve operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	public async getReserveAmount(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					network: this.networkService.environment,
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			const res = await HederaTokenManager__factory.connect(
				coin.coin.evmProxyAddress?.toString(),
				this.signerOrProvider,
			).getReserveAmount();

			return new TransactionResponse(
				undefined,
				BigDecimal.fromStringFixed(res.toString(), RESERVE_DECIMALS),
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				network: this.networkService.environment,
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter update reserve operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	public async updateReserveAmount(
		reserveAddress: ContractId,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		try {
			return RPCTransactionResponseAdapter.manageResponse(
				await HederaReserve__factory.connect(
					reserveAddress.toHederaAddress().toSolidityAddress(),
					this.signerOrProvider,
				).setAmount(amount.toBigNumber(), {
					gasLimit: UPDATE_RESERVE_AMOUNT_GAS,
				}),
				this.networkService.environment,
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				network: this.networkService.environment,
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter updatePorAmount operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	public async upgradeImplementation(
		proxy: HederaId,
		proxyAdminId: HederaId,
		implementationId: ContractId,
	): Promise<TransactionResponse> {
		try {
			return RPCTransactionResponseAdapter.manageResponse(
				await ProxyAdmin__factory.connect(
					proxyAdminId.toHederaAddress().toSolidityAddress(),
					this.signerOrProvider,
				).upgrade(
					proxy.toHederaAddress().toSolidityAddress(),
					implementationId.toHederaAddress().toSolidityAddress(),
					{
						gasLimit: UPDATE_PROXY_IMPLEMENTATION,
					},
				),
				this.networkService.environment,
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				network: this.networkService.environment,
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter updatePorAmount operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	public async changeOwner(
		proxyAdminId: HederaId,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		try {
			return RPCTransactionResponseAdapter.manageResponse(
				await ProxyAdmin__factory.connect(
					proxyAdminId.toHederaAddress().toSolidityAddress(),
					this.signerOrProvider,
				).transferOwnership(await this.getEVMAddress(targetId), {
					gasLimit: CHANGE_PROXY_OWNER,
				}),
				this.networkService.environment,
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				network: this.networkService.environment,
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter updatePorAmount operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async grantRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		role: StableCoinRole,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					network: this.networkService.environment,
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaTokenManager__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).grantRole(role, await this.getEVMAddress(targetId), {
					gasLimit: GRANT_ROLES_GAS,
				}),
				this.networkService.environment,
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				network: this.networkService.environment,
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter grantRole operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async revokeRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		role: StableCoinRole,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					network: this.networkService.environment,
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaTokenManager__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).revokeRole(role, await this.getEVMAddress(targetId), {
					gasLimit: REVOKE_ROLES_GAS,
				}),
				this.networkService.environment,
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				network: this.networkService.environment,
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter revokeRole operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async grantRoles(
		coin: StableCoinCapabilities,
		targetsId: HederaId[],
		roles: StableCoinRole[],
		amounts: BigDecimal[],
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					network: this.networkService.environment,
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			const amountsFormatted: BigNumber[] = [];
			amounts.forEach((amount) => {
				amountsFormatted.push(amount.toBigNumber());
			});

			const accounts: string[] = [];
			for (let i = 0; i < targetsId.length; i++) {
				accounts.push(
					// (await this.accountToEvmAddress(targetsId[i])).toString(),
					await this.getEVMAddress(targetsId[i]),
				);
			}

			let gas = targetsId.length * roles.length * GRANT_ROLES_GAS;
			gas = gas > MAX_ROLES_GAS ? MAX_ROLES_GAS : gas;

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaTokenManager__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).grantRoles(roles, accounts, amountsFormatted, {
					gasLimit: gas,
				}),
				this.networkService.environment,
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				network: this.networkService.environment,
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter grantRoles operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async revokeRoles(
		coin: StableCoinCapabilities,
		targetsId: HederaId[],
		roles: StableCoinRole[],
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					network: this.networkService.environment,
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			const accounts: string[] = [];
			for (let i = 0; i < targetsId.length; i++) {
				accounts.push(
					// (await this.accountToEvmAddress(targetsId[i])).toString(),
					await this.getEVMAddress(targetsId[i]),
				);
			}

			let gas = targetsId.length * roles.length * REVOKE_ROLES_GAS;
			gas = gas > MAX_ROLES_GAS ? MAX_ROLES_GAS : gas;

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaTokenManager__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).revokeRoles(roles, accounts, {
					gasLimit: gas,
				}),
				this.networkService.environment,
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				network: this.networkService.environment,
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter revokeRoles operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async grantSupplierRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					network: this.networkService.environment,
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaTokenManager__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).grantSupplierRole(
					// (await this.accountToEvmAddress(targetId)).toString(),
					await this.getEVMAddress(targetId),
					amount.toBigNumber(),
					{ gasLimit: GRANT_ROLES_GAS },
				),
				this.networkService.environment,
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				network: this.networkService.environment,
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter grantSupplierRole operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async grantUnlimitedSupplierRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
					network: this.networkService.environment,
				});

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaTokenManager__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).grantUnlimitedSupplierRole(
					// (await this.accountToEvmAddress(targetId)).toString(),
					await this.getEVMAddress(targetId),
					{ gasLimit: GRANT_ROLES_GAS },
				),
				this.networkService.environment,
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter grantUnlimitedSupplierRole operation : ${error}`,
				network: this.networkService.environment,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async revokeSupplierRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
					network: this.networkService.environment,
				});

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaTokenManager__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).revokeSupplierRole(await this.getEVMAddress(targetId), {
					gasLimit: REVOKE_ROLES_GAS,
				}),
				this.networkService.environment,
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter revokeSupplierRole operation : ${error}`,
				network: this.networkService.environment,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async hasRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		role: StableCoinRole,
	): Promise<TransactionResponse<boolean, Error>> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
					network: this.networkService.environment,
				});

			const res = await HederaTokenManager__factory.connect(
				coin.coin.evmProxyAddress?.toString(),
				this.signerOrProvider,
			).hasRole(role, await this.getEVMAddress(targetId));

			return new TransactionResponse(undefined, res.valueOf());
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter hasRole operation : ${error}`,
				network: this.networkService.environment,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async balanceOf(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<BigDecimal, Error>> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
					network: this.networkService.environment,
				});
			const res = await HederaTokenManager__factory.connect(
				coin.coin.evmProxyAddress?.toString(),
				this.signerOrProvider,
			).balanceOf(await this.getEVMAddress(targetId));

			return new TransactionResponse(
				undefined,
				BigDecimal.fromStringFixed(res.toString(), coin.coin.decimals),
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter balanceOf operation : ${error}`,
				network: this.networkService.environment,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	/* async associateToken(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
					network: this.networkService.environment,
				});

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaTokenManager__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).associateToken(await this.getEVMAddress(targetId)),
				this.networkService.environment,
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter associateToken operation : ${error}`,
				network: this.networkService.environment,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async dissociateToken(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
					network: this.networkService.environment,
				});

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaTokenManager__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).dissociateToken(await this.getEVMAddress(targetId)),
				this.networkService.environment,
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter dissociateToken operation : ${error}`,
				network: this.networkService.environment,
				transactionId: (error as any).error?.transactionId,
			});
		}
	} */

	async isUnlimitedSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
					network: this.networkService.environment,
				});

			return new TransactionResponse(
				undefined,
				await HederaTokenManager__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).isUnlimitedSupplierAllowance(
					// (await this.accountToEvmAddress(targetId)).toString(),
					await this.getEVMAddress(targetId),
				),
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				network: this.networkService.environment,
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter isUnlimitedSupplierAllowance operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async supplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<BigDecimal, Error>> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					network: this.networkService.environment,
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			const res = await HederaTokenManager__factory.connect(
				coin.coin.evmProxyAddress?.toString(),
				this.signerOrProvider,
			).getSupplierAllowance(
				// (await this.accountToEvmAddress(targetId)).toString(),
				await this.getEVMAddress(targetId),
			);

			return new TransactionResponse(
				undefined,
				BigDecimal.fromStringFixed(res.toString(), coin.coin.decimals),
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				network: this.networkService.environment,
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter supplierAllowance operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async resetSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					network: this.networkService.environment,
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaTokenManager__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).resetSupplierAllowance(await this.getEVMAddress(targetId), {
					gasLimit: RESET_SUPPLY_GAS,
				}),
				this.networkService.environment,
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				network: this.networkService.environment,
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter resetSupplierAllowance operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async increaseSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					network: this.networkService.environment,
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaTokenManager__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).increaseSupplierAllowance(
					// (await this.accountToEvmAddress(targetId)).toString(),
					await this.getEVMAddress(targetId),
					amount.toBigNumber(),
					{ gasLimit: INCREASE_SUPPLY_GAS },
				),
				this.networkService.environment,
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				network: this.networkService.environment,
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter increaseSupplierAllowance operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async decreaseSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					network: this.networkService.environment,
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			return RPCTransactionResponseAdapter.manageResponse(
				await HederaTokenManager__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).decreaseSupplierAllowance(
					// (await this.accountToEvmAddress(targetId)).toString(),
					await this.getEVMAddress(targetId),
					amount.toBigNumber(),
					{ gasLimit: DECREASE_SUPPLY_GAS },
				),
				this.networkService.environment,
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				network: this.networkService.environment,
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter decreaseSupplierAllowance operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async getRoles(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<string[], Error>> {
		try {
			if (!coin.coin.evmProxyAddress?.toString())
				throw new TransactionResponseError({
					network: this.networkService.environment,
					RPC_relay: true,
					message: `StableCoin ${coin.coin.name} does not have a proxy address`,
				});

			return new TransactionResponse(
				undefined,
				await HederaTokenManager__factory.connect(
					coin.coin.evmProxyAddress?.toString(),
					this.signerOrProvider,
				).getRoles(await this.getEVMAddress(targetId)),
			);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				network: this.networkService.environment,
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter getRoles operation : ${error}`,
				transactionId: (error as any).error?.transactionId,
			});
		}
	}

	async grantKyc(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<boolean, Error>> {
		const params = new Params({
			targetId: await this.getEVMAddress(targetId),
		});
		return this.performOperation(coin, Operation.GRANT_KYC, params);
	}

	async revokeKyc(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<boolean, Error>> {
		const params = new Params({
			targetId: await this.getEVMAddress(targetId),
		});
		return this.performOperation(coin, Operation.REVOKE_KYC, params);
	}

	async contractCall(
		contractAddress: string,
		functionName: string,
		param: unknown[],
	): Promise<ContractTransaction> {
		const tokenManager: CallableContract =
			IHederaTokenService__factory.connect(
				contractAddress,
				this.signerOrProvider,
			).functions;
		return tokenManager[functionName](...param);
	}

	/* async transfer(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		sourceId: Account,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		const transfer = await this.precompiledCall('transferToken', [
			coin.coin.tokenId?.toHederaAddress().toSolidityAddress(),
			// await this.accountToEvmAddress(sourceId.id),
			await this.getEVMAddress(sourceId.id),
			// await (await this.accountToEvmAddress(targetId)).toString(),
			await this.getEVMAddress(targetId),
			amount,
		]);
		return RPCTransactionResponseAdapter.manageResponse(
			transfer,
			this.networkService.environment,
		);
	} */

	/* async transferFrom(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		sourceId: HederaId,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		const transfer = await this.precompiledCall('transferFrom', [
			coin.coin.tokenId?.toHederaAddress().toSolidityAddress(),
			// await this.accountToEvmAddress(sourceId),
			await this.getEVMAddress(sourceId),
			// await (await this.accountToEvmAddress(targetId)).toString(),
			await this.getEVMAddress(targetId),
			amount,
		]);
		return RPCTransactionResponseAdapter.manageResponse(
			transfer,
			this.networkService.environment,
		);
	} */

	async signAndSendTransaction(
		t: RPCTransactionAdapter,
	): Promise<TransactionResponse> {
		throw new RuntimeError('Method not implemented.');
	}

	getAccount(): Account {
		return this.account;
	}

	/* async precompiledCall(
		functionName: string,
		param: unknown[],
	): Promise<ContractTransaction> {
		const precompiledAddress = '0000000000000000000000000000000000000167';
		return await this.contractCall(precompiledAddress, functionName, param);
	} */

	/**
	 * TODO consider leaving this as a service and putting two implementations on top for rpc and web wallet.
	 */
	async connectMetamask(pair = true): Promise<Account> {
		try {
			const ethProvider = await detectEthereumProvider();
			if (ethProvider) {
				this.eventService.emit(WalletEvents.walletFound, {
					wallet: SupportedWallets.METAMASK,
					name: SupportedWallets.METAMASK,
				});
				if (ethProvider.isMetaMask) {
					if (!ethereum.isConnected())
						throw new WalletConnectError(
							'Metamask is not connected!',
						);

					pair && (await this.pairWallet());
					this.signerOrProvider = new ethers.providers.Web3Provider(
						// @ts-expect-error No TS compatibility
						ethereum,
					).getSigner();
					return this.account;
				} else {
					throw new WalletConnectError('Metamask was not found!');
				}
			} else {
				throw new WalletConnectError('Metamask was not found!');
			}
		} catch (error: any) {
			if ('code' in error && error.code === 4001) {
				throw new WalletConnectRejectedError(SupportedWallets.METAMASK);
			}
			if (error instanceof WalletConnectError) {
				throw error;
			}
			throw new RuntimeError((error as Error).message);
		}
	}

	private async setMetasmaskAccount(evmAddress: string): Promise<void> {
		let mirrorAccount = undefined;
		try {
			mirrorAccount = await this.mirrorNodeAdapter.getAccountInfo(
				evmAddress,
			);
		} catch (e) {
			LogService.logError(
				'account could not be retrieved from mirror error : ' + e,
			);
		}
		if (mirrorAccount) {
			this.account = new Account({
				id: mirrorAccount.id!,
				evmAddress: mirrorAccount.accountEvmAddress,
				publicKey: mirrorAccount.publicKey,
			});
			this.signerOrProvider = new ethers.providers.Web3Provider(
				// @ts-expect-error No TS compatibility
				ethereum,
			).getSigner();
		} else {
			this.account = Account.NULL;
		}
		LogService.logTrace('Paired Metamask Wallet Event:', this.account);
	}

	private async setMetamaskNetwork(chainId: any): Promise<void> {
		let network = unrecognized;
		let factoryId = '';
		let mirrorNode: MirrorNode = {
			baseUrl: '',
			apiKey: '',
			headerName: '',
		};
		let rpcNode: JsonRpcRelay = {
			baseUrl: '',
			apiKey: '',
			headerName: '',
		};

		const metamaskNetwork = HederaNetworks.find(
			(i: any) => '0x' + i.chainId.toString(16) === chainId.toString(),
		);

		if (metamaskNetwork) {
			network = metamaskNetwork.network;

			if (this.factories) {
				try {
					const result = this.factories.factories.find(
						(i: EnvironmentFactory) =>
							i.environment === metamaskNetwork.network,
					);
					if (result) {
						factoryId = result.factory.toString();
					}
				} catch (e) {
					console.error(
						`Factories could not be found for environment ${metamaskNetwork.network} in  the initially provided list`,
					);
				}
			}
			if (this.mirrorNodes) {
				try {
					const result = this.mirrorNodes.nodes.find(
						(i: EnvironmentMirrorNode) =>
							i.environment === metamaskNetwork.network,
					);
					if (result) {
						mirrorNode = result.mirrorNode;
					}
				} catch (e) {
					console.error(
						`Mirror Nodes could not be found for environment ${metamaskNetwork.network} in  the initially provided list`,
					);
				}
			}
			if ((this, this.jsonRpcRelays)) {
				try {
					const result = this.jsonRpcRelays.nodes.find(
						(i: EnvironmentJsonRpcRelay) =>
							i.environment === metamaskNetwork.network,
					);
					if (result) {
						rpcNode = result.jsonRpcRelay;
					}
				} catch (e) {
					console.error(
						`RPC Nodes could not be found for environment ${metamaskNetwork.network} in  the initially provided list`,
					);
				}
			}
			LogService.logTrace('Metamask Network:', chainId);
		} else {
			console.error(chainId + ' not an hedera network');
		}

		await this.commandBus.execute(
			new SetNetworkCommand(network, mirrorNode, rpcNode),
		);
		await this.commandBus.execute(new SetConfigurationCommand(factoryId));

		this.signerOrProvider = new ethers.providers.Web3Provider(
			// @ts-expect-error No TS compatibility
			ethereum,
		).getSigner();

		// await new Promise(f => setTimeout(f, 3000));
	}

	private async pairWallet(): Promise<void> {
		const accts = await ethereum.request({
			method: 'eth_requestAccounts',
		});
		if (accts && 'length' in accts) {
			const evmAddress = (accts as string[])[0];

			const chainId = await ethereum.request({ method: 'eth_chainId' });
			await this.setMetamaskNetwork(chainId);
			await this.setMetasmaskAccount(evmAddress);
			this.eventService.emit(WalletEvents.walletPaired, {
				data: {
					account: this.account,
					pairing: '',
					topic: '',
				},
				network: {
					name: this.networkService.environment,
					recognized: this.networkService.environment != unrecognized,
					factoryId: this.networkService.configuration
						? this.networkService.configuration.factoryAddress
						: '',
				},
				wallet: SupportedWallets.METAMASK,
			});
		} else {
			LogService.logTrace('Paired Metamask failed with no accounts');
			this.eventService.emit(WalletEvents.walletDisconnect, {
				wallet: SupportedWallets.METAMASK,
			});
		}
	}

	private registerMetamaskEvents(): void {
		try {
			if (typeof window === 'undefined' || !(window as any)?.ethereum)
				return;
			ethereum.on('accountsChanged', async (acct) => {
				const accounts = acct as string[];
				if (
					accounts.length > 0 &&
					this.account &&
					accounts[0] !== this.account.evmAddress
				) {
					await this.setMetasmaskAccount(accounts[0]);
					this.eventService.emit(WalletEvents.walletPaired, {
						data: {
							account: this.account,
							pairing: '',
							topic: '',
						},
						network: {
							name: this.networkService.environment,
							recognized:
								this.networkService.environment != unrecognized,
							factoryId:
								this.networkService.configuration
									.factoryAddress,
						},
						wallet: SupportedWallets.METAMASK,
					});
				} else {
					LogService.logTrace(
						'Metamask disconnected from the wallet',
					);
					this.eventService.emit(WalletEvents.walletDisconnect, {
						wallet: SupportedWallets.METAMASK,
					});
				}
			});
			ethereum.on('chainChanged', async (chainId) => {
				await this.setMetamaskNetwork(chainId);
				let evmAddress = this.account.evmAddress;
				if (!evmAddress) {
					const accts = await ethereum.request({
						method: 'eth_requestAccounts',
					});
					evmAddress =
						accts && 'length' in accts
							? (accts as string[])[0]
							: '';
				}
				await this.setMetasmaskAccount(evmAddress);
				this.eventService.emit(WalletEvents.walletPaired, {
					data: {
						account: this.account,
					},
					network: {
						name: this.networkService.environment,
						recognized:
							this.networkService.environment != unrecognized,
						factoryId: this.networkService.configuration
							? this.networkService.configuration.factoryAddress
							: '',
					},
					wallet: SupportedWallets.METAMASK,
				});
			});
		} catch (error) {
			LogService.logError(error);
			throw new WalletConnectError('Ethereum is not defined');
		}
	}

	async performOperation(
		coin: StableCoinCapabilities,
		operation: Operation,
		params?: Params,
	): Promise<TransactionResponse> {
		try {
			let response;
			switch (CapabilityDecider.decide(coin, operation)) {
				case Decision.CONTRACT:
					if (!coin.coin.evmProxyAddress?.toString())
						throw new Error(
							`StableCoin ${coin.coin.name} does not have a proxy address`,
						);
					response = await this.performSmartContractOperation(
						coin,
						operation,
						params,
					);
					this.logTransaction(
						response.id ?? '',
						this.networkService.environment,
					);
					return response;

				/* case Decision.HTS:
					if (!coin.coin.evmProxyAddress?.toString())
						throw new Error(
							`StableCoin ${coin.coin.name} does not have a proxy address`,
						);
					if (!coin.coin.tokenId)
						throw new Error(
							`StableCoin ${coin.coin.name}  does not have an underlying token`,
						);
					response = await this.performHTSOperation(
						coin,
						operation,
						params,
					);
					this.logTransaction(
						response.id ?? '',
						this.networkService.environment,
					);
					return response; */

				default:
					const tokenId = coin.coin.tokenId
						? coin.coin.tokenId.value
						: '';
					const OperationNotAllowed = new CapabilityError(
						this.getAccount().id.value,
						operation,
						tokenId,
					);
					return new TransactionResponse(
						undefined,
						undefined,
						OperationNotAllowed,
					);
			}
		} catch (error) {
			LogService.logError(error);
			this.logTransaction(
				(error as any).error.transactionHash ?? '',
				this.networkService.environment,
			);
			throw new TransactionResponseError({
				network: this.networkService.environment,
				RPC_relay: true,
				message: `Unexpected error in RPCTransactionAdapter ${operation} operation : ${error}`,
				transactionId: (error as any).error.transactionHash,
			});
		}
	}

	private async performSmartContractOperation(
		coin: StableCoinCapabilities,
		operation: Operation,
		params?: Params,
	): Promise<TransactionResponse> {
		const evmProxy = coin.coin.evmProxyAddress?.toString() ?? '';
		switch (operation) {
			case Operation.CASH_IN:
				const targetEvm = await this.getEVMAddress(
					HederaId.from(params!.targetId!),
				);
				return RPCTransactionResponseAdapter.manageResponse(
					await HederaTokenManager__factory.connect(
						evmProxy,
						this.signerOrProvider,
					).mint(
						targetEvm.toString(),
						params!.amount!.toBigNumber(),
						{ gasLimit: CASHIN_GAS },
					),
					this.networkService.environment,
				);

			case Operation.BURN:
				return RPCTransactionResponseAdapter.manageResponse(
					await HederaTokenManager__factory.connect(
						evmProxy,
						this.signerOrProvider,
					).burn(params!.amount!.toBigNumber(), {
						gasLimit: BURN_GAS,
					}),
					this.networkService.environment,
				);

			case Operation.WIPE:
				return RPCTransactionResponseAdapter.manageResponse(
					await HederaTokenManager__factory.connect(
						evmProxy,
						this.signerOrProvider,
					).wipe(params!.targetId!, params!.amount!.toBigNumber(), {
						gasLimit: WIPE_GAS,
					}),
					this.networkService.environment,
				);

			case Operation.RESCUE:
				return RPCTransactionResponseAdapter.manageResponse(
					await HederaTokenManager__factory.connect(
						evmProxy,
						this.signerOrProvider,
					).rescue(params!.amount!.toBigNumber(), {
						gasLimit: RESCUE_GAS,
					}),
					this.networkService.environment,
				);

			case Operation.RESCUE_HBAR:
				return RPCTransactionResponseAdapter.manageResponse(
					await HederaTokenManager__factory.connect(
						evmProxy,
						this.signerOrProvider,
					).rescueHBAR(params!.amount!.toBigNumber(), {
						gasLimit: RESCUE_HBAR_GAS,
					}),
					this.networkService.environment,
				);

			case Operation.FREEZE:
				return RPCTransactionResponseAdapter.manageResponse(
					await HederaTokenManager__factory.connect(
						evmProxy,
						this.signerOrProvider,
					).freeze(params!.targetId!, { gasLimit: FREEZE_GAS }),
					this.networkService.environment,
				);

			case Operation.UNFREEZE:
				return RPCTransactionResponseAdapter.manageResponse(
					await HederaTokenManager__factory.connect(
						evmProxy,
						this.signerOrProvider,
					).unfreeze(params!.targetId!, { gasLimit: UNFREEZE_GAS }),
					this.networkService.environment,
				);

			case Operation.GRANT_KYC:
				return RPCTransactionResponseAdapter.manageResponse(
					await HederaTokenManager__factory.connect(
						evmProxy,
						this.signerOrProvider,
					).grantKyc(params!.targetId!, { gasLimit: GRANT_KYC_GAS }),
					this.networkService.environment,
				);

			case Operation.REVOKE_KYC:
				return RPCTransactionResponseAdapter.manageResponse(
					await HederaTokenManager__factory.connect(
						evmProxy,
						this.signerOrProvider,
					).revokeKyc(params!.targetId!, {
						gasLimit: REVOKE_KYC_GAS,
					}),
					this.networkService.environment,
				);

			case Operation.PAUSE:
				return RPCTransactionResponseAdapter.manageResponse(
					await HederaTokenManager__factory.connect(
						evmProxy,
						this.signerOrProvider,
					).pause({ gasLimit: PAUSE_GAS }),
					this.networkService.environment,
				);

			case Operation.UNPAUSE:
				return RPCTransactionResponseAdapter.manageResponse(
					await HederaTokenManager__factory.connect(
						evmProxy,
						this.signerOrProvider,
					).unpause({ gasLimit: UNPAUSE_GAS }),
					this.networkService.environment,
				);

			case Operation.DELETE:
				return RPCTransactionResponseAdapter.manageResponse(
					await HederaTokenManager__factory.connect(
						evmProxy,
						this.signerOrProvider,
					).deleteToken({ gasLimit: DELETE_GAS }),
					this.networkService.environment,
				);

			case Operation.UPDATE:
				const providedKeys = [
					undefined,
					params?.kycKey,
					params?.freezeKey,
					params?.wipeKey,
					params?.supplyKey,
					params?.feeScheduleKey,
					params?.pauseKey,
				];
				const filteredContractParams: any = {
					tokenName: params?.name ?? '',
					tokenSymbol: params?.symbol ?? '',
					keys: this.setKeysForSmartContract(providedKeys),
					second: params?.expirationTime
						? Math.floor(params.expirationTime / 1000000000)
						: -1,
					autoRenewPeriod: params?.autoRenewPeriod
						? params.autoRenewPeriod
						: -1,
					metadata: params?.metadata ?? '',
				};
				return RPCTransactionResponseAdapter.manageResponse(
					await HederaTokenManager__factory.connect(
						evmProxy,
						this.signerOrProvider,
					).updateToken(filteredContractParams, {
						gasLimit: UPDATE_TOKEN_GAS,
					}),
					this.networkService.environment,
				);

			default:
				throw new Error(
					`Operation not implemented through Smart Contracts`,
				);
		}
	}

	/* private async performHTSOperation(
		coin: StableCoinCapabilities,
		operation: Operation,
		params?: Params,
	): Promise<TransactionResponse> {
		switch (operation) {
			case Operation.CASH_IN:
				const coinId = TokenId.fromString(
					coin.coin.tokenId?.value ?? '',
				).toSolidityAddress();

				const resp: TransactionResponse<any, Error> =
					await this.checkTransactionResponse(
						await RPCTransactionResponseAdapter.manageResponse(
							await this.precompiledCall('mintToken', [
								coinId,
								params?.amount,
								[],
							]),
							this.networkService.environment,
						),
					);

				if (
					resp.error === undefined &&
					coin.coin.treasury?.value !== params!.targetId?.toString()
				) {
					if (coin.coin.treasury?.value === coin.account.id.value) {
						return await this.transfer(
							coin,
							params!.amount!,
							this.account,
							HederaId.from(params?.targetId),
						);
					} else {
						return await this.transferFrom(
							coin,
							params!.amount!,
							coin.coin.treasury!,
							HederaId.from(params?.targetId),
						);
					}
				} else {
					return resp;
				}

			case Operation.BURN:
				return this.checkTransactionResponse(
					await RPCTransactionResponseAdapter.manageResponse(
						await this.precompiledCall('burnToken', [
							TokenId.fromString(
								coin.coin.tokenId?.value ?? '',
							).toSolidityAddress(),
							params?.amount,
							[],
						]),
						this.networkService.environment,
					),
				);

			case Operation.WIPE:
				return this.checkTransactionResponse(
					await RPCTransactionResponseAdapter.manageResponse(
						await this.precompiledCall('wipeTokenAccount', [
							TokenId.fromString(
								coin.coin.tokenId?.value ?? '',
							).toSolidityAddress(),
							params?.targetId,
							params?.amount,
						]),
						this.networkService.environment,
					),
				);

			case Operation.FREEZE:
				return this.checkTransactionResponse(
					await RPCTransactionResponseAdapter.manageResponse(
						await this.precompiledCall('freezeToken', [
							TokenId.fromString(
								coin.coin.tokenId?.value ?? '',
							).toSolidityAddress(),
							params?.targetId,
						]),
						this.networkService.environment,
					),
				);

			case Operation.UNFREEZE:
				return this.checkTransactionResponse(
					await RPCTransactionResponseAdapter.manageResponse(
						await this.precompiledCall('unfreezeToken', [
							TokenId.fromString(
								coin.coin.tokenId?.value ?? '',
							).toSolidityAddress(),
							params?.targetId,
						]),
						this.networkService.environment,
					),
				);

			case Operation.PAUSE:
				return this.checkTransactionResponse(
					await RPCTransactionResponseAdapter.manageResponse(
						await this.precompiledCall('pauseToken', [
							TokenId.fromString(
								coin.coin.tokenId?.value ?? '',
							).toSolidityAddress(),
						]),
						this.networkService.environment,
					),
				);

			case Operation.UNPAUSE:
				return this.checkTransactionResponse(
					await RPCTransactionResponseAdapter.manageResponse(
						await this.precompiledCall('unpauseToken', [
							TokenId.fromString(
								coin.coin.tokenId?.value ?? '',
							).toSolidityAddress(),
						]),
						this.networkService.environment,
					),
				);

			case Operation.DELETE:
				return this.checkTransactionResponse(
					await RPCTransactionResponseAdapter.manageResponse(
						await this.precompiledCall('deleteToken', [
							TokenId.fromString(
								coin.coin.tokenId?.value ?? '',
							).toSolidityAddress(),
						]),
						this.networkService.environment,
					),
				);

			default:
				throw new Error(`Operation not implemented through HTS`);
		}
	} */

	/* private async checkTransactionResponse(
		transaction: TransactionResponse,
	): Promise<TransactionResponse> {
		const responseCodeLength = 66;
		const responseCodeSuccess =
			'0x0000000000000000000000000000000000000000000000000000000000000016'; // response code 22 SUCCESS

		if (!transaction.id) return transaction;

		const txResponse = await this.mirrorNodeAdapter.getTransactionResult(
			transaction.id,
		);

		this.logTransaction(transaction.id, this.networkService.environment);

		if (
			!txResponse.result ||
			txResponse.result.length < responseCodeLength
		) {
			return transaction;
		}

		const responseCode = txResponse.result.substring(0, responseCodeLength);

		LogService.logTrace('Transaction Response Code : ' + responseCode);

		if (responseCodeSuccess === responseCode) return transaction;

		throw new TransactionResponseError({
			network: this.networkService.environment,
			message: 'Transaction failed with error code : ' + responseCode,
			transactionId: transaction.id,
			RPC_relay: true,
		});
	} */
}

class Params {
	role?: string;
	targetId?: string;
	amount?: BigDecimal;
	name?: string;
	symbol?: string;
	autoRenewPeriod?: number;
	expirationTime?: number;
	kycKey?: PublicKey;
	freezeKey?: PublicKey;
	feeScheduleKey?: PublicKey;
	pauseKey?: PublicKey;
	wipeKey?: PublicKey;
	supplyKey?: PublicKey;
	metadata?: string;

	constructor({
		role,
		targetId,
		amount,
		name,
		symbol,
		autoRenewPeriod,
		expirationTime,
		kycKey,
		freezeKey,
		feeScheduleKey,
		pauseKey,
		wipeKey,
		supplyKey,
		metadata,
	}: {
		role?: string;
		targetId?: string;
		amount?: BigDecimal;
		name?: string;
		symbol?: string;
		autoRenewPeriod?: number;
		expirationTime?: number;
		kycKey?: PublicKey;
		freezeKey?: PublicKey;
		feeScheduleKey?: PublicKey;
		pauseKey?: PublicKey;
		wipeKey?: PublicKey;
		supplyKey?: PublicKey;
		metadata?: string;
	}) {
		this.role = role;
		this.targetId = targetId;
		this.amount = amount;
		this.name = name;
		this.symbol = symbol;
		this.autoRenewPeriod = autoRenewPeriod;
		this.expirationTime = expirationTime;
		this.kycKey = kycKey;
		this.freezeKey = freezeKey;
		this.feeScheduleKey = feeScheduleKey;
		this.pauseKey = pauseKey;
		this.wipeKey = wipeKey;
		this.supplyKey = supplyKey;
		this.metadata = metadata;
	}
}
