/*
 *
 * Hedera Stablecoin SDK
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

import {singleton} from 'tsyringe';
import {AccountId, Signer, Transaction} from '@hashgraph/sdk';
import {NetworkName} from '@hashgraph/sdk/lib/client/Client';
import TransactionAdapter, {InitializationData} from '../TransactionAdapter';
import type {PublicStateControllerState} from '@reown/appkit-controllers';
import {StableCoinProps} from '../../../domain/context/stablecoin/StableCoin';
import ContractId from '../../../domain/context/contract/ContractId';
import {HederaId} from '../../../domain/context/shared/HederaId';
import BigDecimal from '../../../domain/context/shared/BigDecimal';
import {FactoryCashinRole} from '../../../domain/context/factory/FactoryCashinRole';
import {KeysStruct} from '../../../domain/context/factory/FactoryKey';
import {StableCoinRole} from '../../../domain/context/stablecoin/StableCoinRole';
import {ResolverProxyConfiguration} from '../../../domain/context/factory/ResolverProxyConfiguration';
import {FactoryRole} from '../../../domain/context/factory/FactoryRole';
import {FactoryStableCoin} from '../../../domain/context/factory/FactoryStableCoin';
import {TokenSupplyType} from '../../../domain/context/stablecoin/TokenSupply';
import {
	BurnableFacet__factory,
	CashInFacet__factory,
	CustomFeesFacet__factory,
	DeletableFacet__factory,
	DiamondFacet__factory,
	FreezableFacet__factory,
	HederaReserveFacet__factory,
	HederaTokenManagerFacet__factory,
	HoldManagementFacet__factory,
	IHRC__factory,
	KYCFacet__factory,
	PausableFacet__factory,
	RescuableFacet__factory,
	ReserveFacet__factory,
	RoleManagementFacet__factory,
	RolesFacet__factory,
	StableCoinFactoryFacet__factory,
	SupplierAdminFacet__factory,
	WipeableFacet__factory
} from '@hashgraph/stablecoin-npm-contracts';
import LogService from '../../../app/service/LogService';
import {ethers, Provider} from 'ethers';
import {
	ASSOCIATE_GAS,
	BURN_GAS,
	CASHIN_GAS,
	CREATE_HOLD_GAS,
	CREATE_SC_GAS,
	DECREASE_SUPPLY_GAS,
	DELETE_GAS,
	EVM_ZERO_ADDRESS,
	EXECUTE_HOLD_GAS,
	FREEZE_GAS,
	GRANT_KYC_GAS,
	GRANT_ROLES_GAS,
	INCREASE_SUPPLY_GAS,
	MAX_ROLES_GAS,
	PAUSE_GAS,
	RECLAIM_HOLD_GAS,
	RELEASE_HOLD_GAS,
	RESCUE_GAS,
	RESCUE_HBAR_GAS,
	RESET_SUPPLY_GAS,
	REVOKE_KYC_GAS,
	REVOKE_ROLES_GAS,
	TOKEN_CREATION_COST_HBAR,
	UNFREEZE_GAS,
	UNPAUSE_GAS,
	UPDATE_CONFIG_GAS,
	UPDATE_CONFIG_VERSION_GAS,
	UPDATE_CUSTOM_FEES_GAS,
	UPDATE_RESERVE_ADDRESS_GAS,
	UPDATE_RESERVE_AMOUNT_GAS,
	UPDATE_RESOLVER_GAS,
	UPDATE_TOKEN_GAS,
	WIPE_GAS
} from '../../../core/Constants';
import CheckEvmAddress from '../../../core/checks/evmaddress/CheckEvmAddress';
import {TransactionResponseError} from '../error/TransactionResponseError';
import {RPCTransactionResponseAdapter} from '../rpc/RPCTransactionResponseAdapter';
import HWCSettings from '../../../domain/context/hwalletconnectsettings/HWCSettings';
import {Environment, testnet} from '../../../domain/context/network/Environment';
import Account from '../../../domain/context/account/Account';
import {lazyInject} from '../../../core/decorator/LazyInjectDecorator';
import EventService from '../../../app/service/event/EventService';
import NetworkService from '../../../app/service/NetworkService';
import {MirrorNodeAdapter} from '../mirror/MirrorNodeAdapter';
import {QueryBus} from '../../../core/query/QueryBus';
import {Operation, WalletEvents} from '../../in';
import Injectable from '../../../core/Injectable';
import {TransactionType} from '../TransactionResponseEnums';
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse';
import {WalletPairedEvent} from '../../../app/service/event/WalletEvent';
import {SigningError} from '../hs/error/SigningError';
import StableCoinCapabilities from "../../../domain/context/stablecoin/StableCoinCapabilities";
import {CapabilityDecider} from "../CapabilityDecider";
import {CustomFee as HCustomFee} from "@hashgraph/sdk/lib/exports";
import {fromHCustomFeeToSCFee, SC_FixedFee, SC_FractionalFee} from "../../../domain/context/fee/CustomFee";
import PublicKey from "../../../domain/context/account/PublicKey";
import {RESERVE_DECIMALS} from "../../../domain/context/reserve/Reserve";
import {HoldIdentifier} from "../../../domain/context/hold/Hold";

const { SupportedWallets } = require('@hashgraph/stablecoin-npm-sdk') as any;
let HederaAdapter: typeof import('@hashgraph/hedera-wallet-connect').HederaAdapter;
let HederaChainDefinition: typeof import('@hashgraph/hedera-wallet-connect').HederaChainDefinition;
let hederaNamespace: typeof import('@hashgraph/hedera-wallet-connect').hederaNamespace;
let HederaProvider: typeof import('@hashgraph/hedera-wallet-connect').HederaProvider;
let createAppKit: typeof import('@reown/appkit').createAppKit;

if (typeof window !== 'undefined') {
	const hwc = require('@hashgraph/hedera-wallet-connect');
	HederaAdapter = hwc.HederaAdapter;
	HederaChainDefinition = hwc.HederaChainDefinition;
	hederaNamespace = hwc.hederaNamespace;
	HederaProvider = hwc.HederaProvider;

	const appkit = require('@reown/appkit');
	createAppKit = appkit.createAppKit;
}

@singleton()
export class HederaWalletConnectTransactionAdapter extends TransactionAdapter {
	public account!: Account;
	signerOrProvider!: Signer | Provider;
	protected network!: Environment;
	protected projectId = '';
	protected hederaAdapter: InstanceType<typeof HederaAdapter> | undefined;
	protected appKit: any;
	protected hederaProvider: InstanceType<typeof HederaProvider> | undefined;
	protected dappMetadata: { name: string; description: string; url: string; icons: string[] } = {
		name: '',
		description: '',
		url: '',
		icons: [],
	};

	constructor(
		@lazyInject(EventService) public readonly eventService: EventService,
		@lazyInject(NetworkService) public readonly networkService: NetworkService,
		@lazyInject(MirrorNodeAdapter) public readonly mirrorNodeAdapter: MirrorNodeAdapter,
		@lazyInject(QueryBus) public readonly queryBus: QueryBus,
	) {
		super();
	}

	/** Init lifecycle */
	public async init(network?: NetworkName): Promise<string> {
		const currentNetwork = network ?? this.networkService.environment;
		this.eventService.emit(WalletEvents.walletInit, {
			initData: { account: this.account, pairing: '', topic: '' },
			wallet: SupportedWallets.HWALLETCONNECT,
		});
		LogService.logInfo('Hedera WalletConnect handler initialized');
		return currentNetwork;
	}

	/** Register as active tx handler and connect */
	public async register(hwcSettings: HWCSettings): Promise<InitializationData> {
		Injectable.registerTransactionHandler(this);
		if (!hwcSettings) throw new Error('Hedera WalletConnect settings not set');

		this.projectId = hwcSettings.projectId ?? '';
		this.dappMetadata = {
			name: hwcSettings.dappName ?? '',
			description: hwcSettings.dappDescription ?? '',
			url: hwcSettings.dappURL ?? '',
			icons: hwcSettings.dappIcons,
		};

		await this.connectWalletConnect();
		return { account: this.getAccount() };
	}

	/** Top-level connect flow */
	public async connectWalletConnect(network?: string): Promise<string> {
		const currentNetwork = network ?? this.networkService.environment;

		await this.initAdaptersAndProvider(currentNetwork);
		await this.openPairingModal();
		await this.resolveAndCacheAccount(currentNetwork);
		this.subscribe();

		return currentNetwork;
	}

	/** Subscribe to provider + appkit events */
	public subscribe(): void {
		if (!this.hederaProvider) {
			LogService.logInfo('Hedera WalletConnect not initialized; cannot subscribe to events');
			return;
		}

		this.hederaProvider.on('session_delete', async () => {
			await this.stop();
		});

		this.hederaProvider.on('session_update', async (event: unknown) => {
			LogService.logInfo(`HWC session updated: ${JSON.stringify(event)}`);
		});

		this.hederaProvider.on('disconnect', async () => {
			await this.stop();
		});

		if (this.appKit) {
			this.appKit.subscribeState((state: unknown) => {
				LogService.logInfo(`[HWC] AppKit state: ${JSON.stringify(state)}`);
			});
		}
	}

	/** Graceful shutdown */
	public async stop(): Promise<boolean> {
		try {
			await this.hederaProvider?.disconnect();
			await this.appKit?.disconnect();
			this.hederaAdapter = undefined;
			this.appKit = undefined;
			this.hederaProvider = undefined;

			this.eventService.emit(WalletEvents.walletDisconnect, { wallet: SupportedWallets.HWALLETCONNECT });
			LogService.logInfo('Hedera WalletConnect v2 stopped');
			return true;
		} catch (error: any) {
			const msg = String(error?.message ?? error);
			if (msg.includes('No active session') || msg.includes('No matching key')) {
				LogService.logInfo('No active WalletConnect session');
			} else {
				LogService.logError(`Error stopping Hedera WalletConnect: ${msg}`);
			}
			return false;
		}
	}

	/** Sign & send Hedera-native transactions — not implemented */
	public async signAndSendTransaction(
		transaction: Transaction,
		transactionType: TransactionType,
		nameFunction?: string,
		abi?: object[],
	): Promise<TransactionResponse> {
		this.ensureInitialized();
		// The HWC native path is not wired here. Prefer the explicit EVM flows (create/associate)
		throw new Error('Hedera native signAndSendTransaction via WalletConnect is not implemented');
	}

	/** Signing API — not implemented */
	async sign(_message: string | Transaction): Promise<string> {
		throw new Error('Method not implemented: sign');
	}

	/** Create stablecoin using EVM path (WalletConnect eip155) */
	public async create(
		coin: StableCoinProps,
		factory: ContractId,
		createReserve: boolean,
		resolver: ContractId,
		configId: string,
		configVersion: number,
		proxyOwnerAccount: HederaId,
		reserveAddress?: ContractId,
		reserveInitialAmount?: BigDecimal,
		reserveConfigId?: string,
		reserveConfigVersion?: number,
	): Promise<TransactionResponse<any, Error>> {
		this.ensureInitialized();
		try {
			const cashinRole: FactoryCashinRole = {
				account:
					!coin.cashInRoleAccount || coin.cashInRoleAccount.toString() === '0.0.0'
						? '0x0000000000000000000000000000000000000000' // Dirección cero si no se especifica
						: await this.getEVMAddress(coin.cashInRoleAccount),
				allowance: coin.cashInRoleAllowance?.toFixedNumber() ?? BigDecimal.ZERO.toFixedNumber(),
			};

			const keys: KeysStruct[] = this.setKeysForSmartContract([
				coin.adminKey,
				coin.kycKey,
				coin.freezeKey,
				coin.wipeKey,
				coin.supplyKey,
				coin.feeScheduleKey,
				coin.pauseKey,
			]);

			const baseRoles = [
				{ account: proxyOwnerAccount, role: StableCoinRole.DEFAULT_ADMIN_ROLE },
				{ account: coin.burnRoleAccount, role: StableCoinRole.BURN_ROLE },
				{ account: coin.wipeRoleAccount, role: StableCoinRole.WIPE_ROLE },
				{ account: coin.rescueRoleAccount, role: StableCoinRole.RESCUE_ROLE },
				{ account: coin.pauseRoleAccount, role: StableCoinRole.PAUSE_ROLE },
				{ account: coin.freezeRoleAccount, role: StableCoinRole.FREEZE_ROLE },
				{ account: coin.deleteRoleAccount, role: StableCoinRole.DELETE_ROLE },
				{ account: coin.kycRoleAccount, role: StableCoinRole.KYC_ROLE },
				{ account: coin.feeRoleAccount, role: StableCoinRole.CUSTOM_FEES_ROLE },
				{ account: coin.holdCreatorRoleAccount, role: StableCoinRole.HOLD_CREATOR_ROLE },
			];

			const roles = await Promise.all(
				baseRoles
					.filter((r) => r.account && r.account.value !== HederaId.NULL.value)
					.map(async (r) => {
						const fr = new FactoryRole();
						fr.role = r.role;
						fr.account = await this.getEVMAddress(r.account!);
						return fr;
					}),
			);

			const stableCoinConfigurationId: ResolverProxyConfiguration = { key: configId, version: configVersion };

			const reserveConfigurationId = ResolverProxyConfiguration.empty();
			if (createReserve) {
				reserveConfigurationId.key = reserveConfigId!;
				reserveConfigurationId.version = reserveConfigVersion!;
			}

			const resolverEvm = (await this.mirrorNodeAdapter.getContractInfo(resolver.value)).evmAddress;
			const reserveEvm = reserveAddress?.toString?.() === '0.0.0' || !reserveAddress
				? '0x0000000000000000000000000000000000000000'
				: (await this.mirrorNodeAdapter.getContractInfo(reserveAddress.value)).evmAddress;

			const stableCoinToCreate = new FactoryStableCoin(
				coin.name,
				coin.symbol,
				coin.freezeDefault ?? false,
				coin.supplyType === TokenSupplyType.FINITE,
				coin.maxSupply?.toFixedNumber() ?? BigDecimal.ZERO.toFixedNumber(),
				coin.initialSupply?.toFixedNumber() ?? BigDecimal.ZERO.toFixedNumber(),
				coin.decimals,
				reserveEvm,
				reserveInitialAmount?.toFixedNumber() ?? BigDecimal.ZERO.toFixedNumber(),
				createReserve,
				keys,
				roles,
				cashinRole,
				coin.metadata ?? '',
				resolverEvm,
				stableCoinConfigurationId,
				reserveConfigurationId,
			);

			if (!this.isEvmSession()) throw new Error('Hedera native operations not implemented for create');
			if (!this.account.evmAddress) throw new Error('Account EVM address is not set');

			const factoryEvmAddress = (await this.mirrorNodeAdapter.getContractInfo(factory.value)).evmAddress;
			const provider = this.rpcProvider();
			const factoryInstance = StableCoinFactoryFacet__factory.connect(factoryEvmAddress, provider);

			return await this.performOperation(
				factoryEvmAddress,
				new ethers.Interface(StableCoinFactoryFacet__factory.abi),
				'deployStableCoin',
				[stableCoinToCreate],
				CREATE_SC_GAS,
				TOKEN_CREATION_COST_HBAR.toString(),
				{ eventName: 'Deployed', contract: factoryInstance }
			);

		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in create(): ${error}`);
		}
	}

	/** Associate HTS token via EVM (IHRC.associate) */
	async associateToken(tokenId: HederaId, _targetId: HederaId): Promise<TransactionResponse<any, Error>> {
		this.ensureInitialized();
		try {
			if (!this.isEvmSession()) throw new Error('Hedera native operations not implemented for associateToken');
			if (!this.account.evmAddress) throw new Error('Account EVM address is not set');

			const tokenEvm = CheckEvmAddress.toEvmAddress(tokenId.toHederaAddress().toSolidityAddress());

			const response = await this.performOperation(
				tokenEvm,
				new ethers.Interface(IHRC__factory.abi),
				'associate',
				[],
				ASSOCIATE_GAS
			);

			this.logTransaction(response.id ?? '', this.networkService.environment);
			return response;

		} catch (error: any) {
			LogService.logError(error);
			this.logTransaction(error?.error?.transactionHash ?? '', this.networkService.environment);
			throw new TransactionResponseError({
				network: this.networkService.environment,
				RPC_relay: true,
				message: `Unexpected error in associateToken(): ${error}`,
				transactionId: error?.error?.transactionHash,
			});
		}
	}

	async wipe(coin: StableCoinCapabilities, targetId: HederaId, amount: BigDecimal): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.WIPE);
			const proxyAddress = this.getProxyAddress(coin);
			const targetEvm = await this.getEVMAddress(targetId);
			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(WipeableFacet__factory.abi),
				'wipe',
				[targetEvm, amount.toBigInt()],
				WIPE_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in wipe(): ${error}`);
		}
	}

	async cashin(coin: StableCoinCapabilities, targetId: HederaId, amount: BigDecimal): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.CASH_IN);
			const proxyAddress = this.getProxyAddress(coin);
			const targetEvm = await this.getEVMAddress(targetId);
			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(CashInFacet__factory.abi),
				'mint',
				[targetEvm, amount.toBigInt()],
				CASHIN_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in cashin(): ${error}`);
		}
	}

	async burn(coin: StableCoinCapabilities, amount: BigDecimal): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.BURN);
			const proxyAddress = this.getProxyAddress(coin);
			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(BurnableFacet__factory.abi),
				'burn',
				[amount.toBigInt()],
				BURN_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in burn(): ${error}`);
		}
	}

	async freeze(coin: StableCoinCapabilities, targetId: HederaId): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.FREEZE);
			const proxyAddress = this.getProxyAddress(coin);
			const targetEvm = await this.getEVMAddress(targetId);
			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(FreezableFacet__factory.abi),
				'freeze',
				[targetEvm],
				FREEZE_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in freeze(): ${error}`);
		}
	}

	async unfreeze(coin: StableCoinCapabilities, targetId: HederaId): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.UNFREEZE);
			const proxyAddress = this.getProxyAddress(coin);
			const targetEvm = await this.getEVMAddress(targetId);
			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(FreezableFacet__factory.abi),
				'unfreeze',
				[targetEvm],
				UNFREEZE_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in unfreeze(): ${error}`);
		}
	}

	async grantKyc(coin: StableCoinCapabilities, targetId: HederaId): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.GRANT_KYC);
			const proxyAddress = this.getProxyAddress(coin);
			const targetEvm = await this.getEVMAddress(targetId);
			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(KYCFacet__factory.abi),
				'grantKyc',
				[targetEvm],
				GRANT_KYC_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in grantKyc(): ${error}`);
		}
	}

	async revokeKyc(coin: StableCoinCapabilities, targetId: HederaId): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.REVOKE_KYC);
			const proxyAddress = this.getProxyAddress(coin);
			const targetEvm = await this.getEVMAddress(targetId);
			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(KYCFacet__factory.abi),
				'revokeKyc',
				[targetEvm],
				REVOKE_KYC_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in revokeKyc(): ${error}`);
		}
	}

	async pause(coin: StableCoinCapabilities): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.PAUSE);
			const proxyAddress = this.getProxyAddress(coin);
			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(PausableFacet__factory.abi),
				'pause',
				[],
				PAUSE_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in pause(): ${error}`);
		}
	}

	async unpause(coin: StableCoinCapabilities): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.UNPAUSE);
			const proxyAddress = this.getProxyAddress(coin);
			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(PausableFacet__factory.abi),
				'unpause',
				[],
				UNPAUSE_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in unpause(): ${error}`);
		}
	}

	async rescue(coin: StableCoinCapabilities, amount: BigDecimal): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.RESCUE);
			const proxyAddress = this.getProxyAddress(coin);
			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(RescuableFacet__factory.abi),
				'rescue',
				[amount.toBigInt()],
				RESCUE_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in rescue(): ${error}`);
		}
	}

	async rescueHBAR(coin: StableCoinCapabilities, amount: BigDecimal): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.RESCUE_HBAR);
			const proxyAddress = this.getProxyAddress(coin);
			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(RescuableFacet__factory.abi),
				'rescueHBAR',
				[amount.toBigInt()],
				RESCUE_HBAR_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in rescueHBAR(): ${error}`);
		}
	}

	async delete(coin: StableCoinCapabilities): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.DELETE);
			const proxyAddress = this.getProxyAddress(coin);
			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(DeletableFacet__factory.abi),
				'deleteToken',
				[],
				DELETE_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in delete(): ${error}`);
		}
	}

	//-- ROLES

	async grantRole(coin: StableCoinCapabilities, targetId: HederaId, role: StableCoinRole): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.GRANT_ROLE);
			const proxyAddress = this.getProxyAddress(coin);
			const targetEvm = await this.getEVMAddress(targetId);
			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(RolesFacet__factory.abi),
				'grantRole',
				[role, targetEvm],
				GRANT_ROLES_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in grantRole(): ${error}`);
		}
	}

	async revokeRole(coin: StableCoinCapabilities, targetId: HederaId, role: StableCoinRole): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.REVOKE_ROLE);
			const proxyAddress = this.getProxyAddress(coin);
			const targetEvm = await this.getEVMAddress(targetId);
			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(RolesFacet__factory.abi),
				'revokeRole',
				[role, targetEvm],
				REVOKE_ROLES_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in revokeRole(): ${error}`);
		}
	}

	async grantSupplierRole(coin: StableCoinCapabilities, targetId: HederaId, amount: BigDecimal): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.GRANT_SUPPLIER_ROLE); // Asumiendo
			const proxyAddress = this.getProxyAddress(coin);
			const targetEvm = await this.getEVMAddress(targetId);

			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(SupplierAdminFacet__factory.abi),
				'grantSupplierRole',
				[targetEvm, amount.toBigInt()],
				GRANT_ROLES_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in grantSupplierRole(): ${error}`);
		}
	}

	async grantUnlimitedSupplierRole(coin: StableCoinCapabilities, targetId: HederaId): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.GRANT_UNLIMITED_SUPPLIER_ROLE);
			const proxyAddress = this.getProxyAddress(coin);
			const targetEvm = await this.getEVMAddress(targetId);

			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(SupplierAdminFacet__factory.abi),
				'grantUnlimitedSupplierRole',
				[targetEvm],
				GRANT_ROLES_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in grantUnlimitedSupplierRole(): ${error}`);
		}
	}

	async increaseSupplierAllowance(coin: StableCoinCapabilities, targetId: HederaId, amount: BigDecimal): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.INCREASE_SUPPLIER_ALLOWANCE);
			const proxyAddress = this.getProxyAddress(coin);
			const targetEvm = await this.getEVMAddress(targetId);

			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(SupplierAdminFacet__factory.abi),
				'increaseSupplierAllowance',
				[targetEvm, amount.toBigInt()],
				INCREASE_SUPPLY_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in increaseSupplierAllowance(): ${error}`);
		}
	}

	async decreaseSupplierAllowance(coin: StableCoinCapabilities, targetId: HederaId, amount: BigDecimal): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.DECREASE_SUPPLIER_ALLOWANCE);
			const proxyAddress = this.getProxyAddress(coin);
			const targetEvm = await this.getEVMAddress(targetId);

			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(SupplierAdminFacet__factory.abi),
				'decreaseSupplierAllowance',
				[targetEvm, amount.toBigInt()],
				DECREASE_SUPPLY_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in decreaseSupplierAllowance(): ${error}`);
		}
	}

	async grantRoles(
		coin: StableCoinCapabilities,
		targetsId: HederaId[],
		roles: StableCoinRole[],
		amounts: BigDecimal[]
	): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.GRANT_ROLES);
			const proxyAddress = this.getProxyAddress(coin);

			const accounts: string[] = [];
			for (const id of targetsId) accounts.push(await this.getEVMAddress(id));
			const amountsFormatted = amounts.map(a => a.toBigInt());

			let gas = targetsId.length * roles.length * GRANT_ROLES_GAS;
			gas = gas > MAX_ROLES_GAS ? MAX_ROLES_GAS : gas;

			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(RoleManagementFacet__factory.abi),
				'grantRoles',
				[roles, accounts, amountsFormatted],
				gas
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in grantRoles(): ${error}`);
		}
	}

	async revokeRoles(coin: StableCoinCapabilities, targetsId: HederaId[], roles: StableCoinRole[]): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.REVOKE_ROLES);
			const proxyAddress = this.getProxyAddress(coin);

			const accounts: string[] = [];
			for (const id of targetsId) accounts.push(await this.getEVMAddress(id));

			let gas = targetsId.length * roles.length * REVOKE_ROLES_GAS;
			gas = gas > MAX_ROLES_GAS ? MAX_ROLES_GAS : gas;

			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(RoleManagementFacet__factory.abi),
				'revokeRoles',
				[roles, accounts],
				gas
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in revokeRoles(): ${error}`);
		}
	}

	async revokeSupplierRole(coin: StableCoinCapabilities, targetId: HederaId): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.REVOKE_SUPPLIER_ROLE);
			const proxyAddress = this.getProxyAddress(coin);
			const targetEvm = await this.getEVMAddress(targetId);
			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(SupplierAdminFacet__factory.abi),
				'revokeSupplierRole',
				[targetEvm],
				REVOKE_ROLES_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in revokeSupplierRole(): ${error}`);
		}
	}

	async resetSupplierAllowance(coin: StableCoinCapabilities, targetId: HederaId): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.RESET_SUPPLIER_ALLOWANCE);
			const proxyAddress = this.getProxyAddress(coin);
			const targetEvm = await this.getEVMAddress(targetId);
			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(SupplierAdminFacet__factory.abi),
				'resetSupplierAllowance',
				[targetEvm],
				RESET_SUPPLY_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in resetSupplierAllowance(): ${error}`);
		}
	}


	//---- CUSTOM FEES
	async updateCustomFees(coin: StableCoinCapabilities, customFees: HCustomFee[]): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.CREATE_CUSTOM_FEE);
			const proxyAddress = this.getProxyAddress(coin);

			const fixedFees: SC_FixedFee[] = [];
			const fractionalFees: SC_FractionalFee[] = [];

			for (const cf of customFees) {
				const feeCollector = cf.feeCollectorAccountId
					? (await this.mirrorNodeAdapter.getAccountInfo(cf.feeCollectorAccountId.toString())).accountEvmAddress!
					: EVM_ZERO_ADDRESS;

				const scFee = fromHCustomFeeToSCFee(cf, coin.coin.tokenId!.toString(), feeCollector);
				if (scFee instanceof SC_FixedFee) fixedFees.push(scFee);
				else fractionalFees.push(scFee as SC_FractionalFee);
			}

			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(CustomFeesFacet__factory.abi),
				'updateTokenCustomFees',
				[fixedFees, fractionalFees],
				UPDATE_CUSTOM_FEES_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in updateCustomFees(): ${error}`);
		}
	}


	//---- HOLDS
	public async createHold(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		escrow: HederaId,
		expirationDate: BigDecimal,
		targetId?: HederaId
	): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.CREATE_HOLD);

			const proxyAddress = this.getProxyAddress(coin);
			const evmEscrow = await this.getEVMAddress(escrow);
			const evmTo = await this.getEVMAddress(targetId ?? HederaId.NULL);

			const hold = {
				amount: amount.toBigInt(),
				expirationTimestamp: expirationDate.toBigInt(),
				escrow: evmEscrow,
				to: evmTo,
				data: "0x",
			};

			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(HoldManagementFacet__factory.abi),
				"createHold",
				[hold],
				CREATE_HOLD_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in createHold(): ${error}`);
		}
	}

	//TODO: fix
	async executeHold(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		sourceId: HederaId,
		holdId: number,
		target?: HederaId
	): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.EXECUTE_HOLD);
			const proxyAddress = this.getProxyAddress(coin);

			const holdIdentifier: HoldIdentifier = { tokenHolder: await this.getEVMAddress(sourceId), holdId };

			const targetId = target ? await this.getEVMAddress(target) : EVM_ZERO_ADDRESS;

			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(HoldManagementFacet__factory.abi),
				'executeHold',
				[holdIdentifier, targetId, amount.toBigInt()],
				EXECUTE_HOLD_GAS
			);

		} catch (error) {
			console.log(error);
			throw new SigningError(`Unexpected error in executeHold(): ${error}`);
		}
	}

	//TODO: fix
	async releaseHold(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		sourceId: HederaId,
		holdId: number
	): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.RELEASE_HOLD);
			const proxyAddress = this.getProxyAddress(coin);
			const holdIdentifier = { tokenHolder: await this.getEVMAddress(sourceId), holdId };
			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(HoldManagementFacet__factory.abi),
				'releaseHold',
				[holdIdentifier, amount.toBigInt()],
				RELEASE_HOLD_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in releaseHold(): ${error}`);
		}
	}

	async reclaimHold(coin: StableCoinCapabilities, sourceId: HederaId, holdId: number): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.RECLAIM_HOLD);
			const proxyAddress = this.getProxyAddress(coin);
			const holdIdentifier = { tokenHolder: await this.getEVMAddress(sourceId), holdId };
			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(HoldManagementFacet__factory.abi),
				'reclaimHold',
				[holdIdentifier],
				RECLAIM_HOLD_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in reclaimHold(): ${error}`);
		}
	}

	//-- RESERVE
	async getReserveAddress(coin: StableCoinCapabilities): Promise<TransactionResponse> {
		try {
			const proxyAddress = this.getProxyAddress(coin);
			const res = await ReserveFacet__factory
				.connect(proxyAddress, this.rpcProvider())
				.getReserveAddress();

			return new TransactionResponse(undefined, res.toString());
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in getReserveAddress(): ${error}`);
		}
	}

	async updateReserveAddress(coin: StableCoinCapabilities, reserveAddress: ContractId): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.UPDATE_RESERVE_ADDRESS);
			const proxyAddress = this.getProxyAddress(coin);
			const evm = (await this.mirrorNodeAdapter.getContractInfo(reserveAddress.toHederaAddress().toString())).evmAddress;
			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(ReserveFacet__factory.abi),
				'updateReserveAddress',
				[evm],
				UPDATE_RESERVE_ADDRESS_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in updateReserveAddress(): ${error}`);
		}
	}

	async getReserveAmount(coin: StableCoinCapabilities): Promise<TransactionResponse> {
		try {
			const proxyAddress = this.getProxyAddress(coin);
			const res = await ReserveFacet__factory
				.connect(proxyAddress, this.rpcProvider())
				.getReserveAmount();

			return new TransactionResponse(
				undefined,
				BigDecimal.fromStringFixed(res.toString(), RESERVE_DECIMALS)
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in getReserveAmount(): ${error}`);
		}
	}

	async updateReserveAmount(reserveAddress: ContractId, amount: BigDecimal): Promise<TransactionResponse> {
		try {
			const evm = (await this.mirrorNodeAdapter.getContractInfo(reserveAddress.toHederaAddress().toString())).evmAddress;
			return await this.performOperation(
				evm,
				new ethers.Interface(HederaReserveFacet__factory.abi),
				'setAmount',
				[amount.toBigInt()],
				UPDATE_RESERVE_AMOUNT_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in updateReserveAmount(): ${error}`);
		}
	}


	//----QUERIES
	async hasRole(coin: StableCoinCapabilities, targetId: HederaId, role: StableCoinRole): Promise<TransactionResponse> {
		try {
			const proxyAddress = this.getProxyAddress(coin);
			const targetEvm = await this.getEVMAddress(targetId);
			const res = await RolesFacet__factory
				.connect(proxyAddress, this.rpcProvider())
				.hasRole(role, targetEvm);

			return new TransactionResponse(undefined, !!res);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in hasRole(): ${error}`);
		}
	}

	async getRoles(coin: StableCoinCapabilities, targetId: HederaId): Promise<TransactionResponse> {
		try {
			const proxyAddress = this.getProxyAddress(coin);
			const targetEvm = await this.getEVMAddress(targetId);
			const res = await RolesFacet__factory
				.connect(proxyAddress, this.rpcProvider())
				.getRoles(targetEvm);

			return new TransactionResponse(undefined, res);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in getRoles(): ${error}`);
		}
	}

	async balanceOf(coin: StableCoinCapabilities, targetId: HederaId): Promise<TransactionResponse> {
		try {
			const proxyAddress = this.getProxyAddress(coin);
			const targetEvm = await this.getEVMAddress(targetId);
			const res = await HederaTokenManagerFacet__factory
				.connect(proxyAddress, this.rpcProvider())
				.balanceOf(targetEvm);

			return new TransactionResponse(
				undefined,
				BigDecimal.fromStringFixed(res.toString(), coin.coin.decimals)
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in balanceOf(): ${error}`);
		}
	}

	async isUnlimitedSupplierAllowance(coin: StableCoinCapabilities, targetId: HederaId): Promise<TransactionResponse> {
		try {
			const proxyAddress = this.getProxyAddress(coin);
			const targetEvm = await this.getEVMAddress(targetId);
			const res = await SupplierAdminFacet__factory
				.connect(proxyAddress, this.rpcProvider())
				.isUnlimitedSupplierAllowance(targetEvm);

			return new TransactionResponse(undefined, res);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in isUnlimitedSupplierAllowance(): ${error}`);
		}
	}

	async supplierAllowance(coin: StableCoinCapabilities, targetId: HederaId): Promise<TransactionResponse> {
		try {
			const proxyAddress = this.getProxyAddress(coin);
			const targetEvm = await this.getEVMAddress(targetId);
			const res = await SupplierAdminFacet__factory
				.connect(proxyAddress, this.rpcProvider())
				.getSupplierAllowance(targetEvm);

			return new TransactionResponse(
				undefined,
				BigDecimal.fromStringFixed(res.toString(), coin.coin.decimals)
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in supplierAllowance(): ${error}`);
		}
	}

	//-- BLR
	async update(
		coin: StableCoinCapabilities,
		name?: string,
		symbol?: string,
		autoRenewPeriod?: number,
		expirationTime?: number,
		kycKey?: PublicKey,
		freezeKey?: PublicKey,
		feeScheduleKey?: PublicKey,
		pauseKey?: PublicKey,
		wipeKey?: PublicKey,
		metadata?: string
	): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.UPDATE);
			const proxyAddress = this.getProxyAddress(coin);
			const iface = new ethers.Interface(HederaTokenManagerFacet__factory.abi);

			const pkToAddr = async (pk?: PublicKey) =>
				pk ? (await this.mirrorNodeAdapter.getAccountInfo(pk.toString())).accountEvmAddress! : EVM_ZERO_ADDRESS;

			const args = [
				name ?? '',
				symbol ?? '',
				autoRenewPeriod ?? 0,
				expirationTime ?? 0,
				await pkToAddr(kycKey),
				await pkToAddr(freezeKey),
				await pkToAddr(feeScheduleKey),
				await pkToAddr(pauseKey),
				await pkToAddr(wipeKey),
				metadata ?? '',
			];

			return await this.performOperation(proxyAddress, iface, 'updateToken', args, UPDATE_TOKEN_GAS);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in update(): ${error}`);
		}
	}

	async updateConfigVersion(coin: StableCoinCapabilities, configVersion: number): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.UPDATE_CONFIG_VERSION);
			const proxyAddress = this.getProxyAddress(coin);
			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(DiamondFacet__factory.abi),
				'updateConfigVersion',
				[configVersion],
				UPDATE_CONFIG_VERSION_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in updateConfigVersion(): ${error}`);
		}
	}

	async updateConfig(coin: StableCoinCapabilities, configId: string, configVersion: number): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.UPDATE_CONFIG);
			const proxyAddress = this.getProxyAddress(coin);
			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(DiamondFacet__factory.abi),
				'updateConfig',
				[configId, configVersion],
				UPDATE_CONFIG_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in updateConfig(): ${error}`);
		}
	}

	async updateResolver(
		coin: StableCoinCapabilities,
		resolver: ContractId,
		configVersion: number,
		configId: string
	): Promise<TransactionResponse> {
		try {
			CapabilityDecider.checkContractOperation(coin, Operation.UPDATE_RESOLVER);
			const proxyAddress = this.getProxyAddress(coin);
			const resolverEvm = (await this.mirrorNodeAdapter.getContractInfo(resolver.toHederaAddress().toString())).evmAddress;
			return await this.performOperation(
				proxyAddress,
				new ethers.Interface(DiamondFacet__factory.abi),
				'updateResolver',
				[resolverEvm, configVersion, configId],
				UPDATE_RESOLVER_GAS
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in updateResolver(): ${error}`);
		}
	}



	getMirrorNodeAdapter(): MirrorNodeAdapter {
		return this.mirrorNodeAdapter;
	}

	getAccount(): Account {
		return this.account;
	}

	// ===== Helpers ============================================================

	private getProxyAddress(coin: StableCoinCapabilities): string {
		const proxyAddress = coin.coin.evmProxyAddress?.toString();
		if (!proxyAddress) {
			throw new Error(`StableCoin ${coin.coin.name} does not have a proxy address.`);
		}
		return proxyAddress;
	}

	private async performOperation(
		proxyAddress: string,
		iface: ethers.Interface,
		functionName: string,
		params: any[],
		gasLimit: number,
		payableAmountHbar?: string,
		responseOptions?: { eventName: string; contract: ethers.BaseContract }
	): Promise<TransactionResponse> {
		try{
			this.ensureInitialized();
			if (!this.account.evmAddress) throw new Error('Account EVM address is not set');

			const data = iface.encodeFunctionData(functionName, params);
			const chainRef = this.currentEvmChainRef();

			const txParams: any = {
				from: this.account.evmAddress,
				to: proxyAddress,
				data,
				gas: ethers.toBeHex(gasLimit),
			};

			if (payableAmountHbar) {
				txParams.value = ethers.toBeHex(ethers.parseEther(payableAmountHbar));
			}

			const txHash = await this.hederaProvider!.request({ method: 'eth_sendTransaction', params: [txParams] }, chainRef);
			const provider = this.rpcProvider();
			const receipt = await provider.waitForTransaction(txHash as string);

			const responsePayload = { hash: txHash, wait: () => Promise.resolve(receipt) } as any;

			return RPCTransactionResponseAdapter.manageResponse(
				responsePayload,
				this.networkService.environment,
				responseOptions
			);
		} catch (e) {
			console.log('=== FULL ERROR ===');
			console.log(e);
			console.log('==================');
			throw e;
		}
	}

	private ensureInitialized(): void {
		if (!this.hederaProvider) throw new Error('Hedera WalletConnect not initialized');
		if (!this.account) throw new Error('Account not set');
	}

	private ensureFrozen(tx: Transaction): void {
		if (!tx.isFrozen()) {
			tx._freezeWithAccountId(AccountId.fromString(this.account.id.toString()));
		}
	}

	private isTestnet(): boolean {
		return this.networkService.environment === testnet;
	}

	private evmChainId(): '295' | '296' {
		return this.isTestnet() ? '296' : '295';
	}

	private currentEvmChainRef(): `eip155:${string}` {
		return `eip155:${this.evmChainId()}`;
	}

	private rpcProvider(): ethers.JsonRpcProvider {
		return new ethers.JsonRpcProvider(this.networkService.rpcNode?.baseUrl);
	}

	private isEvmSession(): boolean {
		return !this.hederaProvider?.session?.namespaces?.hedera;
	}

	private async initAdaptersAndProvider(currentNetwork: string): Promise<void> {
		const isTestnet = currentNetwork === testnet;

		// Order chains based on current network — HashPack prefers the first
		const nativeNetworks = isTestnet
			? [HederaChainDefinition.Native.Testnet, HederaChainDefinition.Native.Mainnet]
			: [HederaChainDefinition.Native.Mainnet, HederaChainDefinition.Native.Testnet];

		const evmNetworks = isTestnet
			? [HederaChainDefinition.EVM.Testnet, HederaChainDefinition.EVM.Mainnet]
			: [HederaChainDefinition.EVM.Mainnet, HederaChainDefinition.EVM.Testnet];

		this.hederaAdapter = new HederaAdapter({ projectId: this.projectId, networks: nativeNetworks, namespace: hederaNamespace });
		const eip155HederaAdapter = new HederaAdapter({ projectId: this.projectId, networks: evmNetworks, namespace: 'eip155' });

		const eip155Chains = isTestnet ? ['eip155:296', 'eip155:295'] : ['eip155:295', 'eip155:296'];
		const hederaChains = isTestnet ? ['hedera:testnet', 'hedera:mainnet'] : ['hedera:mainnet', 'hedera:testnet'];

		const rpcUrl = this.networkService.rpcNode?.baseUrl || (isTestnet ? 'https://testnet.hashio.io/api' : 'https://mainnet.hashio.io/api');

		const providerOpts = {
			projectId: this.projectId,
			metadata: this.dappMetadata,
			logger: 'error' as const,
			optionalNamespaces: {
				hedera: {
					methods: [
						'hedera_getNodeAddresses',
						'hedera_executeTransaction',
						'hedera_signMessage',
						'hedera_signAndExecuteQuery',
						'hedera_signAndExecuteTransaction',
						'hedera_signTransaction',
					],
					chains: hederaChains,
					events: ['chainChanged', 'accountsChanged'],
				},
				eip155: {
					methods: [
						'eth_sendTransaction',
						'eth_signTransaction',
						'eth_sign',
						'personal_sign',
						'eth_signTypedData',
						'eth_signTypedData_v4',
						'eth_accounts',
						'eth_chainId',
					],
					chains: eip155Chains,
					events: ['chainChanged', 'accountsChanged'],
					rpcMap: {
						'eip155:296': isTestnet ? rpcUrl : 'https://testnet.hashio.io/api',
						'eip155:295': isTestnet ? rpcUrl : 'https://mainnet.hashio.io/api',
					},
				},
			},
		};

		this.hederaProvider = await HederaProvider.init(providerOpts);

		this.appKit = createAppKit({
			adapters: [this.hederaAdapter, eip155HederaAdapter],
			universalProvider: this.hederaProvider,
			projectId: this.projectId,
			metadata: this.dappMetadata,
			networks: [
				HederaChainDefinition.Native.Testnet,
				HederaChainDefinition.Native.Mainnet,
				HederaChainDefinition.EVM.Testnet,
				HederaChainDefinition.EVM.Mainnet,
			],
			features: { analytics: true, socials: false, swaps: false, onramp: false, email: false },
		});

		LogService.logInfo(`HWC initialized with network ${currentNetwork}`);
	}

	private async openPairingModal(): Promise<void> {
		if (!this.appKit) throw new Error('AppKit not initialized');

		await this.appKit.open();
		await new Promise<void>((resolve, reject) => {
			const timeout = setTimeout(() => {
				unsubscribe();
				reject(new Error('Connection timeout'));
			}, 300000);

			const unsubscribe = this.appKit.subscribeState((state: PublicStateControllerState) => {
				if (state.open === false) {
					clearTimeout(timeout);
					unsubscribe();
					resolve();
				}
			});
		});

		await new Promise((r) => setTimeout(r, 300)); // let provider settle
	}

	private async resolveAndCacheAccount(currentNetwork: string): Promise<void> {
		if (!this.hederaProvider) throw new Error('HederaProvider not initialized after connection');

		const hederaAccount = this.hederaProvider.getAccountAddresses()[0];
		if (!hederaAccount) throw new Error('No Hedera account from WalletConnect session');

		const accountMirror = await this.mirrorNodeAdapter.getAccountInfo(hederaAccount);
		if (!accountMirror) throw new Error(`No account info from Mirror Node for ${hederaAccount}`);

		this.account = new Account({ id: accountMirror.id!, publicKey: accountMirror.publicKey, evmAddress: accountMirror.accountEvmAddress });
		this.network = currentNetwork;

		const eventData: WalletPairedEvent = {
			wallet: SupportedWallets.HWALLETCONNECT,
			data: { account: this.account, pairing: '', topic: '' },
			network: {
				name: this.network, recognized: true,
				factoryId: this.networkService.configuration?.factoryAddress || '',
				resolverId: this.networkService.configuration.resolverAddress
					|| '',
			},
		};
		this.eventService.emit(WalletEvents.walletPaired, eventData);
	}
}
