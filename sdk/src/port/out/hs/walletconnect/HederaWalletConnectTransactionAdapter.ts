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
import { AccountId, Signer, Transaction } from '@hiero-ledger/sdk';
import { NetworkName } from '@hiero-ledger/sdk/lib/client/Client';
import { InitializationData } from '../../TransactionAdapter';
import { BaseHederaTransactionAdapter } from '../BaseHederaTransactionAdapter';
import type { PublicStateControllerState } from '@reown/appkit-controllers';
import LogService from '../../../../app/service/LogService';
import { ethers, Provider } from 'ethers';
import HWCSettings from '../../../../domain/context/hwalletconnectsettings/HWCSettings';
import {
	Environment,
	testnet,
} from '../../../../domain/context/network/Environment';
import Account from '../../../../domain/context/account/Account';
import { lazyInject } from '../../../../core/decorator/LazyInjectDecorator';
import EventService from '../../../../app/service/event/EventService';
import NetworkService from '../../../../app/service/NetworkService';
import { MirrorNodeAdapter } from '../../mirror/MirrorNodeAdapter';
import AccountViewModel from '../../mirror/response/AccountViewModel';
import { QueryBus } from '../../../../core/query/QueryBus';
import { WalletEvents } from '../../../in';
import Injectable from '../../../../core/Injectable';
import { TransactionType } from '../../TransactionResponseEnums';
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse';
import { WalletPairedEvent } from '../../../../app/service/event/WalletEvent';
import { SigningError } from '../error/SigningError';
import { RPCTransactionResponseAdapter } from '../../response/RPCTransactionResponseAdapter';
import Hex from '../../../../core/Hex';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { SupportedWallets } = require('@hashgraph/stablecoin-npm-sdk') as any;
let HederaAdapter: typeof import('@hashgraph/hedera-wallet-connect').HederaAdapter;
let HederaChainDefinition: typeof import('@hashgraph/hedera-wallet-connect').HederaChainDefinition;
let hederaNamespace: typeof import('@hashgraph/hedera-wallet-connect').hederaNamespace;
let HederaProvider: typeof import('@hashgraph/hedera-wallet-connect').HederaProvider;
let base64StringToSignatureMap: typeof import('@hashgraph/hedera-wallet-connect').base64StringToSignatureMap;
let createAppKit: typeof import('@reown/appkit').createAppKit;

if (typeof window !== 'undefined') {
	const hwc = require('@hashgraph/hedera-wallet-connect');
	HederaAdapter = hwc.HederaAdapter;
	HederaChainDefinition = hwc.HederaChainDefinition;
	hederaNamespace = hwc.hederaNamespace;
	HederaProvider = hwc.HederaProvider;
	base64StringToSignatureMap = hwc.base64StringToSignatureMap;

	const appkit = require('@reown/appkit');
	createAppKit = appkit.createAppKit;
}

@singleton()
export class HederaWalletConnectTransactionAdapter extends BaseHederaTransactionAdapter {
	public account!: Account;
	signerOrProvider!: Signer | Provider;
	protected network!: Environment;
	protected projectId = '';
	protected hederaAdapter: InstanceType<typeof HederaAdapter> | undefined;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	protected appKit: any;
	protected hederaProvider: InstanceType<typeof HederaProvider> | undefined;
	protected dappMetadata: {
		name: string;
		description: string;
		url: string;
		icons: string[];
	} = {
		name: '',
		description: '',
		url: '',
		icons: [],
	};

	constructor(
		@lazyInject(EventService) public readonly eventService: EventService,
		@lazyInject(NetworkService)
		public readonly networkService: NetworkService,
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNodeAdapter: MirrorNodeAdapter,
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
	public async register(
		hwcSettings: HWCSettings,
	): Promise<InitializationData> {
		Injectable.registerTransactionHandler(this);
		if (!hwcSettings)
			throw new Error('Hedera WalletConnect settings not set');

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

		// Safety net: if eip155Provider is still null after pairing, it means
		// patchInitProviders found no Hedera EVM accounts in the approved session —
		// i.e. MetaMask is connected but has no Hedera EVM chain configured at all.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if (
			this.isEvmSession() &&
			!(this.hederaProvider as any)?.eip155Provider
		) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const accounts: string[] =
				(this.hederaProvider as any)?.session?.namespaces?.eip155
					?.accounts ?? [];
			const allChains = [
				...new Set(
					accounts.map((acc) => acc.split(':').slice(0, 2).join(':')),
				),
			];
			await this.stop();
			throw new Error(
				`MetaMask is not connected to a Hedera EVM network` +
					(allChains.length
						? ` (connected on: ${allChains.join(', ')})`
						: '') +
					`. Please add Hedera EVM Testnet (chainId 296) or Mainnet (chainId 295) to MetaMask, ` +
					`switch to it, and try connecting again.`,
			);
		}

		await this.resolveAndCacheAccount(currentNetwork);
		this.subscribe();

		return currentNetwork;
	}

	/** Subscribe to provider + appkit events */
	public subscribe(): void {
		if (!this.hederaProvider) {
			LogService.logInfo(
				'Hedera WalletConnect not initialized; cannot subscribe to events',
			);
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
				LogService.logInfo(
					`[HWC] AppKit state: ${JSON.stringify(state)}`,
				);
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

			this.eventService.emit(WalletEvents.walletDisconnect, {
				wallet: SupportedWallets.HWALLETCONNECT,
			});
			LogService.logInfo('Hedera WalletConnect v2 stopped');
			return true;
		} catch (error) {
			const msg = String((error as Error)?.message ?? error);
			if (
				msg.includes('No active session') ||
				msg.includes('No matching key')
			) {
				LogService.logInfo('No active WalletConnect session');
			} else {
				LogService.logError(
					`Error stopping Hedera WalletConnect: ${msg}`,
				);
			}
			return false;
		}
	}

	/**
	 * Signs a transaction using Hedera WalletConnect (sign-only, no execution).
	 * Used for multi-signature flows where the signature is submitted to the backend.
	 *
	 * Sends hedera_signTransaction via request() to the wallet which shows a
	 * signing modal. The wallet expects transactionBody as a base64-encoded
	 * protobuf TransactionBody (not the full Transaction envelope).
	 */
	async sign(message: string | Transaction): Promise<string> {
		LogService.logInfo('Signing transaction from HWC...');
		this.ensureInitialized();

		if (this.isEvmSession()) {
			throw new SigningError(
				'Multisig signing is not supported when connected with an EVM wallet via WalletConnect.',
			);
		}

		if (!(message instanceof Transaction)) {
			throw new SigningError(
				'Hedera WalletConnect must sign a transaction not a string',
			);
		}

		if (
			!this.networkService.consensusNodes ||
			this.networkService.consensusNodes.length === 0
		) {
			throw new Error(
				'In order to sign multisignature transactions you must set consensus nodes for the environment',
			);
		}

		try {
			this.ensureFrozen(message);

			// The wallet expects transactionBody as a base64-encoded protobuf
			// TransactionBody — NOT the full transaction bytes from toBytes().
			// Extract the bodyBytes from the first signed transaction entry,
			// which is the serialized TransactionBody after freezing.
			const bodyBytes = message._signedTransactions.get(0).bodyBytes;
			if (!bodyBytes) {
				throw new Error('No body bytes found in frozen transaction');
			}
			const transactionBodyBase64 =
				Buffer.from(bodyBytes).toString('base64');

			const chainRef = this.isTestnet()
				? 'hedera:testnet'
				: 'hedera:mainnet';

			const params = {
				transactionBody: transactionBodyBase64,
				signerAccountId: `${chainRef}:${this.account.id.toString()}`,
			};

			LogService.logTrace(
				`[HWC] Signing tx for account: ${this.account.id.toString()}`,
			);

			// Send via request() so the wallet shows its signing modal
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const signResult = await this.hederaProvider!.request(
				{
					method: 'hedera_signTransaction',
					params,
				},
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				chainRef as any,
			);

			LogService.logInfo('Transaction signed successfully');
			LogService.logTrace(
				`Signature result: ${JSON.stringify(signResult)}`,
			);

			// The wallet returns { signatureMap: base64String }
			// where signatureMap is a protobuf-encoded proto.SignatureMap
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const resultAny = signResult as any;
			const base64SigMap = resultAny?.signatureMap;

			if (!base64SigMap || typeof base64SigMap !== 'string') {
				throw new Error(
					'No signatureMap returned from WalletConnect sign',
				);
			}

			// Decode the protobuf SignatureMap from base64
			const signatureMap = base64StringToSignatureMap(base64SigMap);

			if (!signatureMap.sigPair || signatureMap.sigPair.length === 0) {
				throw new Error('No signatures found in signature map');
			}

			// Extract the raw signature bytes (ed25519 or ECDSA)
			const firstPair = signatureMap.sigPair[0];
			const signature = firstPair.ed25519 || firstPair.ECDSASecp256k1;

			if (!signature) {
				throw new Error('Signature is empty');
			}

			const hexSignature = Hex.fromUint8Array(
				signature instanceof Uint8Array
					? signature
					: new Uint8Array(signature),
			);

			LogService.logTrace(`Final hex signature: ${hexSignature}`);

			return hexSignature;
		} catch (error) {
			throw new SigningError(JSON.stringify(error, null, 2));
		}
	}

	// ===== Abstract Method Implementations =====

	/**
	 * Process a Hedera SDK transaction via WalletConnect.
	 * This is called by the base class for native HTS operations.
	 */
	/* eslint-disable @typescript-eslint/no-unused-vars */
	public async processTransaction(
		tx: Transaction,
		_transactionType: TransactionType,
		_startDate?: string,
	): Promise<TransactionResponse> {
		/* eslint-enable @typescript-eslint/no-unused-vars */
		return await this.executeNativeTransaction(tx);
	}

	/**
	 * Execute a contract call. Routes to EVM or native Hedera based on session type.
	 * Overrides base implementation to support EVM sessions with proper address handling.
	 */
	public async executeContractCall(
		contractId: string,
		iface: ethers.Interface,
		functionName: string,
		params: unknown[],
		gasLimit: number,
		transactionType: TransactionType = TransactionType.RECEIPT,
		payableAmountHbar?: string,
		startDate?: string,
		evmAddress?: string,
	): Promise<TransactionResponse> {
		if (this.isEvmSession()) {
			// EVM session - need EVM address format
			let addressToUse = evmAddress || contractId;

			// Only call Mirror Node if we don't have EVM address and contractId is Hedera ID format
			if (!evmAddress && contractId.match(/^0\.0\.\d+$/)) {
				const contractInfo =
					await this.mirrorNodeAdapter.getContractInfo(contractId);
				addressToUse = contractInfo.evmAddress;
			}

			return await this.executeEvmContractCall(
				addressToUse,
				iface,
				functionName,
				params,
				gasLimit,
				payableAmountHbar,
			);
		} else {
			// Native Hedera session - use default implementation with Hedera ID
			return await super.executeContractCall(
				contractId,
				iface,
				functionName,
				params,
				gasLimit,
				transactionType,
				payableAmountHbar,
				startDate,
				evmAddress,
			);
		}
	}

	/**
	 * Get the network service.
	 */
	public getNetworkService(): NetworkService {
		return this.networkService;
	}

	/**
	 * Get the mirror node adapter.
	 */
	public getMirrorNodeAdapter(): MirrorNodeAdapter {
		return this.mirrorNodeAdapter;
	}

	// ===== Helper Methods =====

	getAccount(): Account {
		return this.account;
	}

	public supportsEvmOperations(): boolean {
		return this.isEvmSession();
	}

	// ===== Helpers ============================================================

	private async executeEvmContractCall(
		proxyAddress: string,
		iface: ethers.Interface,
		functionName: string,
		params: unknown[],
		gasLimit: number,
		payableAmountHbar?: string,
		responseOptions?: { eventName: string; contract: ethers.BaseContract },
	): Promise<TransactionResponse> {
		try {
			this.ensureInitialized();
			if (!this.account.evmAddress)
				throw new Error('Account EVM address is not set');

			const data = iface.encodeFunctionData(functionName, params);
			const chainRef = this.currentEvmChainRef();

			const txParams: Record<string, string> = {
				from: this.account.evmAddress,
				to: proxyAddress,
				data,
				gas: ethers.toBeHex(gasLimit),
			};

			if (payableAmountHbar) {
				txParams.value = ethers.toBeHex(
					ethers.parseEther(payableAmountHbar),
				);
			}

			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const txHash = await this.hederaProvider!.request(
				{ method: 'eth_sendTransaction', params: [txParams] },
				chainRef,
			);
			const provider = this.rpcProvider();
			const receipt = await provider.waitForTransaction(txHash as string);

			/* eslint-disable @typescript-eslint/no-explicit-any */
			const responsePayload = {
				hash: txHash,
				wait: () => Promise.resolve(receipt),
			} as any;
			/* eslint-enable @typescript-eslint/no-explicit-any */

			return RPCTransactionResponseAdapter.manageResponse(
				responsePayload,
				this.networkService.environment,
				responseOptions,
			);
		} catch (e) {
			console.log('=== FULL ERROR ===');
			console.log(e);
			console.log('==================');
			throw e;
		}
	}

	/**
	 * Execute a native Hedera transaction (any HTS or Contract transaction)
	 * via WalletConnect using hedera_signAndExecuteTransaction
	 */
	private async executeNativeTransaction(
		transaction: Transaction,
	): Promise<TransactionResponse> {
		try {
			this.ensureInitialized();

			LogService.logInfo(
				`[HWC Native] Executing ${transaction.constructor.name}`,
			);

			// Freeze transaction with account ID
			this.ensureFrozen(transaction);

			LogService.logTrace(
				`[HWC Native] Transaction frozen for account ${this.account.id.toString()}`,
			);

			// Serialize transaction to bytes and then to base64
			const transactionBytes = transaction.toBytes();
			const transactionBase64 =
				Buffer.from(transactionBytes).toString('base64');

			LogService.logTrace(
				`[HWC Native] Transaction serialized, size: ${transactionBytes.length} bytes`,
			);

			// Determine chain reference for native Hedera
			const chainRef = this.isTestnet()
				? 'hedera:testnet'
				: 'hedera:mainnet';

			// Use hederaProvider to sign and execute the transaction
			const executeParams = {
				transactionList: transactionBase64,
				signerAccountId: `${chainRef}:${this.account.id.toString()}`,
			};

			LogService.logInfo(
				`[HWC Native] Sending transaction for signing...`,
			);
			LogService.logTrace(
				`[HWC Native] Execute params: ${JSON.stringify(executeParams)}`,
			);

			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const result = await this.hederaProvider!.request(
				{
					method: 'hedera_signAndExecuteTransaction',
					params: executeParams,
				},
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				chainRef as any,
			);

			LogService.logInfo(
				`[HWC Native] Transaction executed successfully`,
			);
			LogService.logTrace(
				`[HWC Native] Result: ${JSON.stringify(result)}`,
			);

			// Parse the result - it should return transaction response data
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const txResponse = result as any;

			// Log transaction ID if available
			if (txResponse?.transactionId) {
				this.logTransaction(
					txResponse.transactionId,
					this.networkService.environment,
				);
			}

			// Return a TransactionResponse
			return new TransactionResponse(
				txResponse?.transactionId || txResponse?.result?.transactionId,
				txResponse,
			);
		} catch (error) {
			LogService.logError(
				'[HWC Native] Error executing transaction:',
				error,
			);
			console.log('=== FULL ERROR (Native) ===');
			console.log('Error type:', typeof error);
			const err = error as Record<string, unknown>;
			console.log('Error code:', err?.code);
			console.log('Error message:', err?.message);
			console.log('Error data:', err?.data);
			console.log('Full error object:', error);
			console.log('JSON error:', JSON.stringify(error, null, 2));
			console.log('===========================');

			throw new SigningError(
				`Native Hedera transaction failed: ${error}`,
			);
		}
	}

	private ensureInitialized(): void {
		if (!this.hederaProvider)
			throw new Error('Hedera WalletConnect not initialized');
		if (!this.account) throw new Error('Account not set');
	}

	private ensureFrozen(tx: Transaction): void {
		if (!tx.isFrozen()) {
			tx._freezeWithAccountId(
				AccountId.fromString(this.account.id.toString()),
			);
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

	/**
	 * Patches `hederaProvider.initProviders` so that when MetaMask includes many
	 * non-Hedera chains in its approved WalletConnect session (e.g. Ethereum mainnet,
	 * Polygon, Base, …), the `EIP155Provider` constructor only sees the Hedera EVM
	 * chains (chainIds 295 / 296).
	 *
	 * Background: `EIP155Provider.createHttpProvider` throws "No RPC url provided for
	 * chainId: X" for any chain that is not in `HederaChainDefinition.EVM` and has no
	 * entry in `rpcMap`. MetaMask v11+ includes ALL configured networks in the approved
	 * session, so the plain `rpcMap: { "eip155:296": …, "eip155:295": … }` is not
	 * enough. By filtering the session accounts to only Hedera EVM accounts before
	 * `EIP155Provider` is constructed, we avoid the throw and allow `eip155Provider` to
	 * be set correctly.
	 *
	 * The session accounts are restored immediately after the call so the rest of the
	 * app continues to see the full account list.
	 */
	private patchInitProviders(): void {
		if (!this.hederaProvider) return;

		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const provider = this.hederaProvider;
		const hederaEvmChains = new Set(['eip155:295', 'eip155:296']);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const orig = (provider as any).initProviders.bind(provider);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(provider as any).initProviders = function (this: any) {
			const sessionEip155 = this.session?.namespaces?.eip155;

			if (!sessionEip155?.accounts?.length) {
				return orig();
			}

			const original = sessionEip155.accounts as string[];
			const hederaOnly = original.filter((acc: string) => {
				const [ns, chainId] = acc.split(':');
				return hederaEvmChains.has(`${ns}:${chainId}`);
			});

			if (hederaOnly.length === 0) {
				// No Hedera EVM accounts — let the original run so the error surfaces normally.
				return orig();
			}

			sessionEip155.accounts = hederaOnly;
			try {
				return orig();
			} finally {
				sessionEip155.accounts = original; // always restore the full list
			}
		};
	}

	private async initAdaptersAndProvider(
		currentNetwork: string,
	): Promise<void> {
		const isTestnet = currentNetwork === testnet;

		// Order chains based on current network — HashPack prefers the first
		const nativeNetworks = isTestnet
			? [
					HederaChainDefinition.Native.Testnet,
					HederaChainDefinition.Native.Mainnet,
			  ]
			: [
					HederaChainDefinition.Native.Mainnet,
					HederaChainDefinition.Native.Testnet,
			  ];

		const evmNetworks = isTestnet
			? [
					HederaChainDefinition.EVM.Testnet,
					HederaChainDefinition.EVM.Mainnet,
			  ]
			: [
					HederaChainDefinition.EVM.Mainnet,
					HederaChainDefinition.EVM.Testnet,
			  ];

		this.hederaAdapter = new HederaAdapter({
			projectId: this.projectId,
			networks: nativeNetworks,
			namespace: hederaNamespace,
		});
		const eip155HederaAdapter = new HederaAdapter({
			projectId: this.projectId,
			networks: evmNetworks,
			namespace: 'eip155',
		});

		const eip155Chains = isTestnet
			? ['eip155:296', 'eip155:295']
			: ['eip155:295', 'eip155:296'];
		const hederaChains = isTestnet
			? ['hedera:testnet', 'hedera:mainnet']
			: ['hedera:mainnet', 'hedera:testnet'];

		const rpcUrl =
			this.networkService.rpcNode?.baseUrl ||
			(isTestnet
				? 'https://testnet.hashio.io/api'
				: 'https://mainnet.hashio.io/api');

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
						// Required so EIP155Provider.switchChain forwards these to MetaMask via
						// WalletConnect when AppKit's "Switch network" flow is triggered.
						'wallet_switchEthereumChain',
						'wallet_addEthereumChain',
					],
					chains: eip155Chains,
					events: ['chainChanged', 'accountsChanged'],
					rpcMap: {
						'eip155:296': isTestnet
							? rpcUrl
							: 'https://testnet.hashio.io/api',
						'eip155:295': isTestnet
							? rpcUrl
							: 'https://mainnet.hashio.io/api', // Include some common non-Hedera chains to prevent "No RPC url provided for chainId: X" errors in MetaMask if those chains are in the approved session. The URLs won't actually be used since our patched initProviders filters to only Hedera EVM chains, but this keeps MetaMask happy.
					},
				},
			},
		};

		this.hederaProvider = await HederaProvider.init(providerOpts);
		this.patchInitProviders();

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
			features: {
				analytics: true,
				socials: false,
				swaps: false,
				onramp: false,
				email: false,
			},
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

			const unsubscribe = this.appKit.subscribeState(
				(state: PublicStateControllerState) => {
					if (state.open === false) {
						clearTimeout(timeout);
						unsubscribe();
						resolve();
					}
				},
			);
		});

		await new Promise((r) => setTimeout(r, 300)); // let provider settle
	}

	private async resolveAndCacheAccount(
		currentNetwork: string,
	): Promise<void> {
		if (!this.hederaProvider)
			throw new Error('HederaProvider not initialized after connection');

		const hederaAccount = this.hederaProvider.getAccountAddresses()[0];
		if (!hederaAccount)
			throw new Error('No Hedera account from WalletConnect session');

		LogService.logInfo(
			`[WalletConnect] Provided account: ${hederaAccount}`,
		);

		let accountMirror: AccountViewModel;
		try {
			accountMirror = await this.mirrorNodeAdapter.getAccountInfo(
				hederaAccount,
			);
			LogService.logInfo(
				`[WalletConnect] Successfully retrieved account info from Mirror Node`,
			);
		} catch (error) {
			const errorMessage = `Account ${hederaAccount} does not exist in ${currentNetwork}. Please create or import an account for this network in your wallet.`;
			LogService.logError(`[WalletConnect] ${errorMessage}`);
			console.error(`[WalletConnect Error] ${errorMessage}`);
			throw new Error(errorMessage);
		}

		if (!accountMirror || !accountMirror.id) {
			const errorMessage = `No valid account info from Mirror Node for ${hederaAccount} in ${currentNetwork}`;
			LogService.logError(`[WalletConnect] ${errorMessage}`);
			console.error(`[WalletConnect Error] ${errorMessage}`);
			throw new Error(
				`Account ${hederaAccount} does not exist in ${currentNetwork}. Please verify your account exists in this network.`,
			);
		}

		const accountId = accountMirror.id;
		if (!accountId) throw new Error('Account ID is missing');
		this.account = new Account({
			id: accountId,
			publicKey: accountMirror.publicKey,
			evmAddress: accountMirror.accountEvmAddress,
		});
		this.network = currentNetwork;

		const eventData: WalletPairedEvent = {
			wallet: SupportedWallets.HWALLETCONNECT,
			data: { account: this.account, pairing: '', topic: '' },
			network: {
				name: this.network,
				recognized: true,
				factoryId:
					this.networkService.configuration?.factoryAddress || '',
				resolverId:
					this.networkService.configuration.resolverAddress || '',
			},
			isEvmWallet: this.isEvmSession(),
		};
		this.eventService.emit(WalletEvents.walletPaired, eventData);
	}
}
