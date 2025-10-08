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

/*
 * We disable the @typescript-eslint/ban-ts-comment rule for the entire file because
 * certain TypeScript type checks need to be ignored in specific instances due to
 * dynamic imports or third-party library integrations that do not provide complete
 * type definitions. This allows us to proceed without ESLint raising unnecessary
 * warnings for these cases.
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { singleton } from 'tsyringe';
import {
	AccountId,
	Signer,
	Transaction,
} from '@hashgraph/sdk';
import { NetworkName } from '@hashgraph/sdk/lib/client/Client';
import { HederaTransactionAdapter } from '../HederaTransactionAdapter';
import { TransactionType } from '../../TransactionResponseEnums';
import { InitializationData } from '../../TransactionAdapter';
import { MirrorNodeAdapter } from '../../mirror/MirrorNodeAdapter';
import {
	WalletEvents,
	WalletPairedEvent,
} from '../../../../app/service/event/WalletEvent';
import LogService from '../../../../app/service/LogService';
import EventService from '../../../../app/service/event/EventService';
import NetworkService from '../../../../app/service/NetworkService';
import { lazyInject } from '../../../../core/decorator/LazyInjectDecorator';
import Injectable from '../../../../core/Injectable';
import { QueryBus } from '../../../../core/query/QueryBus';
import Account from '../../../../domain/context/account/Account';
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse.js';
import {
	Environment,
	mainnet,
	testnet,
} from '../../../../domain/context/network/Environment';
import { SupportedWallets } from '../../../../domain/context/network/Wallet';
import HWCSettings from '../../../../domain/context/hwalletconnectsettings/HWCSettings.js';
import { HederaTransactionResponseAdapter } from '../HederaTransactionResponseAdapter';
import { SigningError } from '../error/SigningError';
import Hex from '../../../../core/Hex.js';

let HederaAdapter: typeof import('@hashgraph/hedera-wallet-connect').HederaAdapter;
let HederaChainDefinition: typeof import('@hashgraph/hedera-wallet-connect').HederaChainDefinition;
let hederaNamespace: typeof import('@hashgraph/hedera-wallet-connect').hederaNamespace;
let HederaProvider: typeof import('@hashgraph/hedera-wallet-connect').HederaProvider;
let createAppKit: typeof import('@reown/appkit').createAppKit;
let UniversalProvider: typeof import('@walletconnect/universal-provider').default;
let transactionToBase64String: typeof import('@hashgraph/hedera-wallet-connect').transactionToBase64String;
let ledgerIdToCAIPChainId: typeof import('@hashgraph/hedera-wallet-connect').ledgerIdToCAIPChainId;

if (typeof window !== 'undefined') {
	const hwc = require('@hashgraph/hedera-wallet-connect');
	HederaAdapter = hwc.HederaAdapter;
	HederaChainDefinition = hwc.HederaChainDefinition;
	hederaNamespace = hwc.hederaNamespace;
	HederaProvider = hwc.HederaProvider;
	transactionToBase64String = hwc.transactionToBase64String;
	ledgerIdToCAIPChainId = hwc.ledgerIdToCAIPChainId;

	const appkit = require('@reown/appkit');
	createAppKit = appkit.createAppKit;

	const universalProvider = require('@walletconnect/universal-provider');
	UniversalProvider = universalProvider.default;
}

@singleton()
/**
 * Represents a transaction adapter for Hedera Wallet Connect.
 */
export class HederaWalletConnectTransactionAdapter extends HederaTransactionAdapter {
	public account: Account;
	public signer: Signer;
	protected network: Environment;
	protected projectId: string;
	protected hederaAdapter: InstanceType<typeof HederaAdapter> | undefined;
	protected appKit: any;
	protected universalProvider: any;
	protected hederaProvider: InstanceType<typeof HederaProvider> | undefined;
	protected dappMetadata: {
		name: string;
		description: string;
		url: string;
		icons: string[];
	};

	constructor(
		@lazyInject(EventService)
		public readonly eventService: EventService,
		@lazyInject(NetworkService)
		public readonly networkService: NetworkService,
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNodeAdapter: MirrorNodeAdapter,
		@lazyInject(QueryBus)
		public readonly queryBus: QueryBus,
	) {
		super(mirrorNodeAdapter, networkService);
		this.projectId = '';
		this.dappMetadata = {
			name: '',
			description: '',
			url: '',
			icons: [],
		};
	}

	/**
	 * Initializes the Hedera Wallet Connect Transaction Adapter.
	 *
	 * @param network - Optional parameter specifying the network name.
	 * @returns A promise that resolves to the current network name.
	 */
	public async init(network?: NetworkName): Promise<string> {
		const currentNetwork = network ?? this.networkService.environment;

		const eventData = {
			initData: {
				account: this.account,
				pairing: '',
				topic: '',
			},
			wallet: SupportedWallets.HWALLETCONNECT,
		};
		this.eventService.emit(WalletEvents.walletInit, eventData);
		LogService.logInfo('✅ Hedera Wallet Connect Handler Initialized');
		return currentNetwork;
	}

	/**
	 * Registers the Hedera WalletConnect transaction adapter.
	 * This method registers the transaction handler and connects to WalletConnect.
	 *
	 * @returns A promise that resolves to an object containing the account information.
	 */
	public async register(
		hWCSettings: HWCSettings,
	): Promise<InitializationData> {
		Injectable.registerTransactionHandler(this);
		LogService.logTrace('Hedera WalletConnect registered as handler');

		if (!hWCSettings)
			throw new Error('hedera wallet connect settings not set');
		this.projectId = hWCSettings.projectId ?? '';
		this.dappMetadata = {
			name: hWCSettings.dappName ?? '',
			description: hWCSettings.dappDescription ?? '',
			url: hWCSettings.dappURL ?? '',
			icons: hWCSettings.dappIcons,
		};

		await this.connectWalletConnect();

		return { account: this.getAccount() };
	}

	private getChainDefinition(network: Environment): any {
		switch (network) {
			case testnet:
				return HederaChainDefinition.Native.Testnet;
			case mainnet:
				return HederaChainDefinition.Native.Mainnet;
			default:
				throw new Error(`❌ Invalid network name: ${network}`);
		}
	}

	/**
	 * Gets supported chains based on network configuration.
	 * Returns all available chains to support network switching.
	 */
	private getSupportedChains(): any[] {
		// Support all chains to allow network switching
		return [
			HederaChainDefinition.Native.Mainnet,
			HederaChainDefinition.Native.Testnet
		];
	}

	/**
	 * Connects to the Hedera WalletConnect.
	 *
	 * @param network - Optional. The network to connect to. If not provided, the default network from the network service will be used.
	 * @returns A promise that resolves to a string representing the current network.
	 * @throws If there is an error initializing the Hedera WalletConnect or retrieving account information.
	 */
	public async connectWalletConnect(network?: string): Promise<string> {
		const currentNetwork = network ?? this.networkService.environment;

		LogService.logInfo(`🚀 [HWC] Starting connectWalletConnect with network: ${currentNetwork}`);
		LogService.logTrace(`[HWC] DApp Metadata: ${JSON.stringify(this.dappMetadata, null, 2)}`);
		LogService.logTrace(`[HWC] Project ID: ${this.projectId}`);

		try {

			/*
			LogService.logTrace(`[HWC] Creating HederaAdapter instance...`);
			const supportedChains = this.getSupportedChains();

			this.hederaAdapter = new HederaAdapter({
				projectId: this.projectId,
				networks: supportedChains,
				namespace: hederaNamespace,
			});

			LogService.logTrace(`[HWC] Supported chains: ${JSON.stringify(supportedChains)}`);

			LogService.logTrace(`[HWC] Creating AppKit...`);


			this.appKit = createAppKit({
				adapters: [this.hederaAdapter],
				networks: [supportedChains[0], ...supportedChains.slice(1)],
				projectId: this.projectId,
				metadata: this.dappMetadata,
			});
			 */

			try {
				LogService.logTrace(`[HWC] Creating HederaAdapter instance...`);
				const supportedChains = this.getSupportedChains();

				/*this.hederaAdapter = new HederaAdapter({
					projectId: this.projectId,
					networks: supportedChains,
					namespace: hederaNamespace,
				});*/

				// Create adapters
				this.hederaAdapter = new HederaAdapter({
					projectId: this.projectId,
					networks: [HederaChainDefinition.Native.Testnet, HederaChainDefinition.Native.Mainnet],
					namespace: hederaNamespace, // 'hedera' as ChainNamespace
				})

				LogService.logTrace(`[HWC] Supported chains: ${JSON.stringify(supportedChains)}`);

				LogService.logTrace(`[HWC] Creating AppKit...`);

				const providerOpts = {
					projectId: this.projectId,
					metadata: this.dappMetadata,
					logger: 'error' as const,
					optionalNamespaces: {
						// hashpack only uses the first namespace in the list
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
							chains: ['eip155:296', 'eip155:295'], // Testnet first, then mainnet
							events: ['chainChanged', 'accountsChanged'],
							rpcMap: {
								'eip155:296': 'https://testnet.hashio.io/api',
								'eip155:295': 'https://mainnet.hashio.io/api',
							},
						},
						hedera: {
							methods: [
								'hedera_getNodeAddresses',
								'hedera_executeTransaction',
								'hedera_signMessage',
								'hedera_signAndExecuteQuery',
								'hedera_signAndExecuteTransaction',
								'hedera_signTransaction',
							],
							chains: ['hedera:testnet', 'hedera:mainnet'], // Hashpack only uses the first chain in the list, also this seems to dictate testnet vs mainnet for EIP155
							events: ['chainChanged', 'accountsChanged'],
						},
					},
				}

				//const jsonRpcProvider = new JsonRpcProvider(rpcUrl)


				const eip155HederaAdapter = new HederaAdapter({
					projectId: this.projectId,
					networks: [HederaChainDefinition.EVM.Testnet, HederaChainDefinition.EVM.Mainnet],
					namespace: 'eip155',
				})

				const universalProvider = await HederaProvider.init(providerOpts)

				createAppKit({
					adapters: [this.hederaAdapter, eip155HederaAdapter],
					logger: 'error' as const,
					// @ts-expect-error universalProvider type compatibility
					universalProvider,
					projectId: this.projectId,
					metadata: this.dappMetadata,
					networks: [supportedChains[0], ...supportedChains.slice(1)],
					enableReconnect: true,
					features: {
						analytics: true,
						socials: false,
						swaps: false,
						onramp: false,
						email: false,
					},
					chainImages: {
						'hedera:testnet': '/hedera.svg',
						'hedera:mainnet': '/hedera.svg',
						'eip155:296': '/hedera.svg',
						'eip155:295': '/hedera.svg',
					},
				})


				LogService.logInfo(
				`✅ HWC v2 Initialized with network: ${currentNetwork} and projectId: ${this.projectId}`,
			);
		} catch (error) {
			LogService.logError(
				`❌ Error initializing HWC v2 with network: ${currentNetwork} and projectId: ${this.projectId}`,
				error,
			);
			LogService.logError(`[HWC] Error details: ${JSON.stringify(error, null, 2)}`);
			return currentNetwork;
		}

		try {
			LogService.logInfo('🔗 [HWC] Opening AppKit modal for pairing...');
			await this.appKit.open();
			LogService.logInfo('✅ [HWC] AppKit modal opened successfully');

			// Wait for connection to be fully established
			await new Promise<void>((resolve, reject) => {
				const timeout = setTimeout(() => {
					unsubscribe();
					reject(new Error('Connection timeout'));
				}, 300000); // 5 minutes timeout

				const unsubscribe = this.appKit.subscribeState((state: any) => {
					LogService.logTrace(`[HWC] AppKit state: open=${state.open}, address=${state.address}, selectedNetworkId=${state.selectedNetworkId}`);

					// Wait for the modal to close AND have a connected address
					if (state.open === false && state.address) {
						clearTimeout(timeout);
						unsubscribe();
						LogService.logInfo(`[HWC] Connection established with address: ${state.address}`);
						resolve();
					}
				});
			});

			// Give a small delay to ensure the provider is fully initialized
			await new Promise(resolve => setTimeout(resolve, 1000));

		} catch (error) {
			LogService.logError('❌ [HWC] Error during connection', error);
			throw error;
		}

		LogService.logTrace('[HWC] Getting UniversalProvider from HederaAdapter...');
		this.universalProvider = this.hederaAdapter.getWalletConnectProvider();

		if (!this.universalProvider) {
			throw new Error('❌ Failed to get UniversalProvider from HederaAdapter');
		}

		LogService.logTrace('[HWC] Creating HederaProvider...');
		this.hederaProvider = new HederaProvider(
			this.universalProvider,
		);

		LogService.logTrace('[HWC] Getting connected accounts...');
		const accounts = this.hederaProvider.getAccountAddresses();

		if (!accounts || accounts.length === 0) {
			const errorMsg = `❌ No accounts retrieved from wallet connect.`;
			LogService.logError(errorMsg);
			throw new Error(errorMsg);
		}

		const accountId = accounts[0];
		LogService.logInfo(`[HWC] Account ID retrieved: ${accountId}`);

		LogService.logTrace(`[HWC] Fetching account info from Mirror Node for: ${accountId}`);
		const accountMirror = await this.mirrorNodeAdapter.getAccountInfo(
			accountId,
		);

		if (!accountMirror) {
			const errorMsg = `❌ No account info retrieved from Mirror Node. Account ID: ${accountId}`;
			LogService.logError(errorMsg);
			throw new Error(errorMsg);
		}

		LogService.logInfo(`✅ [HWC] Account info retrieved from Mirror Node`);
		LogService.logTrace(`[HWC] Account details: ${JSON.stringify(accountMirror, null, 2)}`)

		// Create account object and set network
		// Note: The signer will be created through HederaProvider methods
		this.account = new Account({
			id: accountId,
			publicKey: accountMirror.publicKey,
			evmAddress: accountMirror.accountEvmAddress,
		});
		this.network = currentNetwork;
		LogService.logInfo(
			`✅ Hedera WalletConnect v2 paired with account: ${accountId}`,
		);
		const eventData: WalletPairedEvent = {
			wallet: SupportedWallets.HWALLETCONNECT,
			data: {
				account: this.account,
				pairing: '',
				topic: '',
			},
			network: {
				name: this.network,
				recognized: true,
				factoryId:
					this.networkService.configuration?.factoryAddress || '',
			},
		};
		this.eventService.emit(WalletEvents.walletPaired, eventData);
		// Subscribe to HWC events
		this.subscribe();
		return this.network;
	}

	public subscribe(): void {
		if (!this.universalProvider) {
			LogService.logError(
				`❌ Hedera WalletConnect not initialized. Cannot subscribe to events`,
			);
			return;
		}

		// Handle session deletions
		this.universalProvider.on(
			'session_delete',
			async () => {
				LogService.logInfo('📤 Session deleted event received');
				await this.stop();
			},
		);

		// Handle session updates
		this.universalProvider.on(
			'session_update',
			async (event: any) => {
				LogService.logInfo('🔄 Session updated event received', event);
			},
		);

		// Handle disconnect
		this.universalProvider.on('disconnect', async () => {
			LogService.logInfo('🔌 Disconnect event received');
			await this.stop();
		});

		// Subscribe to AppKit state changes
		if (this.appKit) {
			this.appKit.subscribeState((state: any) => {
				LogService.logTrace(`[HWC] AppKit state changed: ${JSON.stringify(state)}`);
			});
		}
	}

	/**
	 * Stops the Hedera WalletConnect connection.
	 * @returns A promise that resolves to a boolean indicating whether the stop operation was successful.
	 */
	public async stop(): Promise<boolean> {
		try {
			if (this.universalProvider) {
				await this.universalProvider.disconnect();
			}
			if (this.appKit) {
				await this.appKit.disconnect();
			}
			this.hederaAdapter = undefined;
			this.appKit = undefined;
			this.universalProvider = undefined;
			this.hederaProvider = undefined;
			LogService.logInfo(
				`🛑 🏁 Hedera WalletConnect v2 stopped successfully`,
			);
			this.eventService.emit(WalletEvents.walletDisconnect, {
				wallet: SupportedWallets.HWALLETCONNECT,
			});
			return Promise.resolve(true);
		} catch (error) {
			if (
				(error as Error).message.includes('No active session') ||
				(error as Error).message.includes('No matching key')
			) {
				LogService.logInfo(
					`🔍 No active session found for Hedera WalletConnect`,
				);
			} else {
				LogService.logError(
					`❌ Error stopping Hedera WalletConnect: ${
						(error as Error).message
					}`,
				);
			}
			return Promise.resolve(false);
		}
	}

	/**
	 * Restarts the transaction adapter with the specified network.
	 * @param network The network name to initialize the adapter with.
	 * @returns A promise that resolves when the adapter has been restarted.
	 */
	public async restart(network: NetworkName): Promise<void> {
		await this.stop();
		await this.init(network);
	}

	public async signAndSendTransaction(
		transaction: Transaction,
		transactionType: TransactionType,
		nameFunction?: string | undefined,
		abi?: object[] | undefined,
	): Promise<TransactionResponse> {
		LogService.logInfo(`🔏 Signing and sending transaction from HWC v2...`);
		this.ensureInitialized();

		try {
			this.ensureTransactionFrozen(transaction);

			LogService.logTrace(`🖋️ [HWC] Signing and executing transaction with HederaProvider...`);

			// Convert transaction to base64 and prepare params
			const transactionBase64 = transactionToBase64String(transaction);
			const ledgerId = this.networkService.environment === testnet ?
				require('@hashgraph/sdk').LedgerId.TESTNET :
				require('@hashgraph/sdk').LedgerId.MAINNET;
			const signerAccountId = ledgerIdToCAIPChainId(ledgerId) + ':' + this.account.id.toString();

			const transactionResponse = await this.hederaProvider!.hedera_signAndExecuteTransaction({
				signerAccountId,
				transactionList: transactionBase64,
			});

			LogService.logInfo(`✅ Transaction signed and sent successfully!`);
			LogService.logTrace(
				`Transaction response: ${JSON.stringify(
					transactionResponse,
					null,
					2,
				)}`,
			);

			return await HederaTransactionResponseAdapter.manageResponse(
				this.networkService.environment,
				undefined as any, // No signer needed anymore
				transactionResponse as any, // TransactionResponseJSON will be handled by manageResponse
				transactionType,
				nameFunction,
				abi,
			);
		} catch (error) {
			if (error instanceof Error) {
				LogService.logError(error.stack);
			}
			throw new Error(
				`Error signing and sending transaction: ${
					error instanceof Object
						? JSON.stringify(error, null, 2)
						: error
				}`,
			);
		}
	}

	private ensureInitialized(): void {
		if (!this.hederaProvider)
			throw new Error('❌ Hedera WalletConnect not initialized');
		if (!this.account) throw new Error('❌ Account not set');
	}

	private ensureTransactionFrozen(transaction: Transaction): void {
		if (!transaction.isFrozen()) {
			LogService.logTrace(`🔒 Tx not frozen, freezing transaction...`);
			transaction._freezeWithAccountId(
				AccountId.fromString(this.account.id.toString()),
			);
		}
	}

	getAccount(): Account {
		return this.account;
	}

	/**
	 * Signs a transaction using Hedera WalletConnect.
	 * @param message - The transaction to sign.
	 * @returns A promise that resolves to the hexadecimal signature of the signed transaction.
	 * @throws Error if Hedera WalletConnect is not initialized, account is not set, no signers found,
	 * the message is not an instance of Transaction, or consensus nodes are not set for the environment.
	 * @throws SigningError if an error occurs during the signing process.
	 */
	async sign(message: string | Transaction): Promise<string> {
		LogService.logInfo('🔏 Signing transaction from HWC v2...');
		this.ensureInitialized();

		if (!(message instanceof Transaction))
			throw new SigningError(
				'❌ Hedera WalletConnect must sign a transaction not a string',
			);

		if (
			!this.networkService.consensusNodes ||
			this.networkService.consensusNodes.length === 0
		) {
			throw new Error(
				'❌ In order to create sign multisignature transactions you must set consensus nodes for the environment',
			);
		}

		try {
			this.ensureTransactionFrozen(message);

			LogService.logTrace(`🖋️ [HWC] Signing transaction with HederaProvider...`);

			// Convert transaction to base64 and prepare params
			const transactionBase64 = transactionToBase64String(message);
			const ledgerId = this.networkService.environment === testnet ?
				require('@hashgraph/sdk').LedgerId.TESTNET :
				require('@hashgraph/sdk').LedgerId.MAINNET;
			const signerAccountId = ledgerIdToCAIPChainId(ledgerId) + ':' + this.account.id.toString();

			const signedTransaction = await this.hederaProvider!.hedera_signTransaction({
				signerAccountId,
				transactionBody: transactionBase64,
			});

			LogService.logInfo(`✅ Transaction signed successfully!`);

			if (!signedTransaction) {
				throw new Error(
					'❌ No signed transaction returned from WalletConnect',
				);
			}

			const signatureMap = signedTransaction.getSignatures();

			const flatSigList = signatureMap.getFlatSignatureList();

			if (flatSigList.length === 0) {
				throw new Error('No signatures found');
			}

			const firstSigPair = flatSigList[0];

			const iterator = firstSigPair[Symbol.iterator]();
			const firstEntry = iterator.next();

			if (firstEntry.done) {
				throw new Error(
					'No signatures found in first SignaturePairMap',
				);
			}

			const [, firstSignature] = firstEntry.value;

			if (!firstSignature) {
				throw new Error('Signature is empty');
			}

			const hexSignature = Hex.fromUint8Array(firstSignature);

			LogService.logTrace(
				`Final hexadecimal signature: ${JSON.stringify(
					hexSignature,
					null,
					2,
				)}`,
			);

			return hexSignature;
		} catch (error) {
			throw new SigningError(JSON.stringify(error, null, 2));
		}
	}
}
