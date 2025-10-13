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

import { singleton } from 'tsyringe';
import { AccountId, Signer, Transaction } from '@hashgraph/sdk';
import { NetworkName } from '@hashgraph/sdk/lib/client/Client';
import TransactionAdapter, { InitializationData } from '../TransactionAdapter';
import type { PublicStateControllerState } from '@reown/appkit-controllers';
import { StableCoinProps } from '../../../domain/context/stablecoin/StableCoin';
import ContractId from '../../../domain/context/contract/ContractId';
import { HederaId } from '../../../domain/context/shared/HederaId';
import BigDecimal from '../../../domain/context/shared/BigDecimal';
import { FactoryCashinRole } from '../../../domain/context/factory/FactoryCashinRole';
import { KeysStruct } from '../../../domain/context/factory/FactoryKey';
import { StableCoinRole } from '../../../domain/context/stablecoin/StableCoinRole';
import { ResolverProxyConfiguration } from '../../../domain/context/factory/ResolverProxyConfiguration';
import { FactoryRole } from '../../../domain/context/factory/FactoryRole';
import { FactoryStableCoin } from '../../../domain/context/factory/FactoryStableCoin';
import { TokenSupplyType } from '../../../domain/context/stablecoin/TokenSupply';
import { StableCoinFactoryFacet__factory, IHRC__factory } from '@hashgraph/stablecoin-npm-contracts';
import LogService from '../../../app/service/LogService';
import { ethers, Provider } from 'ethers';
import { CREATE_SC_GAS, TOKEN_CREATION_COST_HBAR, ASSOCIATE_GAS } from '../../../core/Constants';
import CheckEvmAddress from '../../../core/checks/evmaddress/CheckEvmAddress';
import { TransactionResponseError } from '../error/TransactionResponseError';
import { RPCTransactionResponseAdapter } from '../rpc/RPCTransactionResponseAdapter';
import HWCSettings from '../../../domain/context/hwalletconnectsettings/HWCSettings';
import { Environment, testnet } from '../../../domain/context/network/Environment';
import Account from '../../../domain/context/account/Account';
import { lazyInject } from '../../../core/decorator/LazyInjectDecorator';
import EventService from '../../../app/service/event/EventService';
import NetworkService from '../../../app/service/NetworkService';
import { MirrorNodeAdapter } from '../mirror/MirrorNodeAdapter';
import { QueryBus } from '../../../core/query/QueryBus';
import { SupportedWallets } from '@hashgraph/stablecoin-npm-sdk';
import { WalletEvents } from '../../in';
import Injectable from '../../../core/Injectable';
import { TransactionType } from '../TransactionResponseEnums';
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse';
import { WalletPairedEvent } from '../../../app/service/event/WalletEvent';
import { SigningError } from '../hs/error/SigningError';

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
		try {
			const cashinRole: FactoryCashinRole = {
				account:
					!coin.cashInRoleAccount || coin.cashInRoleAccount.toString() === '0.0.0'
						? '0x0000000000000000000000000000000000000000'
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

			// Require EVM path for now
			if (!this.isEvmSession()) throw new Error('Hedera native operations not implemented for create');
			if (!this.account.evmAddress) throw new Error('Account EVM address is not set');

			const factoryEvmAddress = (await this.mirrorNodeAdapter.getContractInfo(factory.value)).evmAddress;
			const iface = new ethers.Interface(StableCoinFactoryFacet__factory.abi);
			const data = iface.encodeFunctionData('deployStableCoin', [stableCoinToCreate]);

			const chainRef = this.currentEvmChainRef();
			const txParams = {
				from: this.account.evmAddress,
				to: factoryEvmAddress,
				data,
				value: ethers.toBeHex(ethers.parseEther(TOKEN_CREATION_COST_HBAR.toString())),
				gas: ethers.toBeHex(CREATE_SC_GAS),
			};

			const txHash = await this.hederaProvider!.request({ method: 'eth_sendTransaction', params: [txParams] }, chainRef);
			const provider = this.rpcProvider();
			const receipt = await provider.waitForTransaction(txHash as string);

			const factoryInstance = StableCoinFactoryFacet__factory.connect(factoryEvmAddress, provider);
			return RPCTransactionResponseAdapter.manageResponse(
				{ hash: txHash, wait: () => Promise.resolve(receipt) } as any,
				this.networkService.environment,
				{ eventName: 'Deployed', contract: factoryInstance },
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in create(): ${error}`);
		}
	}

	/** Associate HTS token via EVM (IHRC.associate) */
	async associateToken(tokenId: HederaId, _targetId: HederaId): Promise<TransactionResponse<any, Error>> {
		try {
			if (!this.isEvmSession()) throw new Error('Hedera native operations not implemented for associateToken');
			if (!this.account.evmAddress) throw new Error('Account EVM address is not set');

			const tokenEvm = CheckEvmAddress.toEvmAddress(tokenId.toHederaAddress().toSolidityAddress());
			const iface = new ethers.Interface(IHRC__factory.abi);
			const data = iface.encodeFunctionData('associate');

			const chainRef = this.currentEvmChainRef();
			const txParams = { from: this.account.evmAddress, to: tokenEvm, data, gas: ethers.toBeHex(ASSOCIATE_GAS) };

			const txHash = await this.hederaProvider!.request({ method: 'eth_sendTransaction', params: [txParams] }, chainRef);
			const provider = this.rpcProvider();
			const receipt = await provider.waitForTransaction(txHash as string);

			const response = await RPCTransactionResponseAdapter.manageResponse(
				{ hash: txHash, wait: () => Promise.resolve(receipt) } as any,
				this.networkService.environment,
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

	getMirrorNodeAdapter(): MirrorNodeAdapter {
		return this.mirrorNodeAdapter;
	}

	// ===== Helpers ============================================================

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
			network: { name: this.network, recognized: true, factoryId: this.networkService.configuration?.factoryAddress || '' },
		};
		this.eventService.emit(WalletEvents.walletPaired, eventData);
	}
}
