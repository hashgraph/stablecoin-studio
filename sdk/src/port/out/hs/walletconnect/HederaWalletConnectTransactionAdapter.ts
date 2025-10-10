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
	LedgerId,
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
import type {PublicStateControllerState} from "@reown/appkit-controllers";

let HederaAdapter: typeof import('@hashgraph/hedera-wallet-connect').HederaAdapter;
let HederaChainDefinition: typeof import('@hashgraph/hedera-wallet-connect').HederaChainDefinition;
let hederaNamespace: typeof import('@hashgraph/hedera-wallet-connect').hederaNamespace;
let HederaProvider: typeof import('@hashgraph/hedera-wallet-connect').HederaProvider;
let createAppKit: typeof import('@reown/appkit').createAppKit;
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

	// const universalProvider = require('@walletconnect/universal-provider');
	// UniversalProvider = universalProvider.default;
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
		console.log('✅ Hedera Wallet Connect Handler Initialized');
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
		console.log('Hedera WalletConnect registered as handler');

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

		return Promise.resolve({
			account: this.getAccount(),
		});
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
	 * Connects to the Hedera WalletConnect.
	 *
	 * @param network - Optional. The network to connect to. If not provided, the default network from the network service will be used.
	 * @returns A promise that resolves to a string representing the current network.
	 * @throws If there is an error initializing the Hedera WalletConnect or retrieving account information.
	 */
	public async connectWalletConnect(network?: string): Promise<string> {
		const currentNetwork = network ?? this.networkService.environment;

		console.log(`🚀 [HWC] Starting connectWalletConnect with network: ${currentNetwork}`);
		console.log(`[HWC] DApp Metadata: ${JSON.stringify(this.dappMetadata, null, 2)}`);
		console.log(`[HWC] Project ID: ${this.projectId}`);
		console.log(`[HWC] NetworkService Configuration:`);
		console.log(`  - Factory Address: ${this.networkService.configuration?.factoryAddress || 'NOT SET'}`);
		console.log(`  - Resolver Address: ${this.networkService.configuration?.resolverAddress || 'NOT SET'}`);
		console.log(`  - RPC URL: ${this.networkService.rpcNode?.baseUrl || 'NOT SET'}`);
		console.log(`  - Mirror Node: ${this.networkService.mirrorNode?.baseUrl || 'NOT SET'}`);

		try {
			console.log(`[HWC] Creating HederaAdapter instances...`);

			// Determine if we're on testnet or mainnet
			const isTestnet = currentNetwork === testnet;
			console.log(`[HWC] Network detected: ${isTestnet ? 'Testnet' : 'Mainnet'}`);

			// Order chains based on current network - first chain is used by HashPack
			const nativeNetworks = isTestnet
				? [HederaChainDefinition.Native.Testnet, HederaChainDefinition.Native.Mainnet]
				: [HederaChainDefinition.Native.Mainnet, HederaChainDefinition.Native.Testnet];

			const evmNetworks = isTestnet
				? [HederaChainDefinition.EVM.Testnet, HederaChainDefinition.EVM.Mainnet]
				: [HederaChainDefinition.EVM.Mainnet, HederaChainDefinition.EVM.Testnet];

			// Create Native Hedera adapter
			this.hederaAdapter = new HederaAdapter({
				projectId: this.projectId,
				networks: nativeNetworks,
				namespace: hederaNamespace, // 'hedera' as ChainNamespace
			});

			// Create EIP155 Hedera adapter
			const eip155HederaAdapter = new HederaAdapter({
				projectId: this.projectId,
				networks: evmNetworks,
				namespace: 'eip155',
			});

			console.log(`[HWC] Creating HederaProvider with optionalNamespaces...`);

			// Order chains based on current network - HashPack uses the first chain
			const eip155Chains = isTestnet ? ['eip155:296', 'eip155:295'] : ['eip155:295', 'eip155:296'];
			const hederaChains = isTestnet ? ['hedera:testnet', 'hedera:mainnet'] : ['hedera:mainnet', 'hedera:testnet'];

			// Get RPC URL from networkService configuration
			const rpcUrl = this.networkService.rpcNode?.baseUrl ||
				(isTestnet ? 'https://testnet.hashio.io/api' : 'https://mainnet.hashio.io/api');

			console.log(`[HWC] Using RPC URL: ${rpcUrl}`);
			console.log(`[HWC] Factory Address: ${this.networkService.configuration?.factoryAddress || 'Not set'}`);

			const providerOpts = {
				projectId: this.projectId,
				metadata: this.dappMetadata,
				logger: 'error' as const,
				optionalNamespaces: {
					// HashPack only uses the first namespace in the list
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
					}
				},
			};

			this.hederaProvider = await HederaProvider.init(providerOpts)

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
			})


			console.log(
				`✅ HWC v2 Initialized with network: ${currentNetwork} and projectId: ${this.projectId}`,
			);
		} catch (error) {
			console.log(
				`❌ Error initializing HWC v2 with network: ${currentNetwork} and projectId: ${this.projectId}`,
				error,
			);
			console.log(`[HWC] Error details: ${JSON.stringify(error, null, 2)}`);
			return currentNetwork;
		}

		try {
			console.log('🔗 [HWC] Opening AppKit modal for pairing...');
			await this.appKit.open();
			console.log('✅ [HWC] AppKit modal opened successfully');

			// Wait for connection to be fully established
			await new Promise<void>((resolve, reject) => {
				const timeout = setTimeout(() => {
					unsubscribe();
					reject(new Error('Connection timeout'));
				}, 300000); // 5 minutes timeout

				const unsubscribe = this.appKit.subscribeState((state: PublicStateControllerState) => {
					console.log(`[HWC] AppKit state: open=${state.open}, chain=${state.activeChain}, selectedNetworkId=${state.selectedNetworkId}`);

					// Wait for the modal to close AND have a connected address
					if (state.open === false) {
						clearTimeout(timeout);
						unsubscribe();
						resolve();
					}
				});
			});

			// Give a small delay to ensure the provider is fully initialized
			await new Promise(resolve => setTimeout(resolve, 1000));

		} catch (error) {
			console.log('❌ [HWC] Error during connection', error);
			throw error;
		}

		// Verify provider is still available
		if (!this.hederaProvider) {
			throw new Error('❌ HederaProvider is not initialized after connection');
		}


		console.log('[HWC] Getting connected account from session...');
		console.log(`[HWC] HederaProvider session available: ${!!this.hederaProvider.session}`);

		// Get the hedera account from the session namespaces (format: hedera:testnet:0.0.12345)
		const hederaAccount = this.hederaProvider?.getAccountAddresses()[0]

		if (!hederaAccount) {
			const errorMsg = `❌ No Hedera account retrieved from wallet connect session.`;
			console.log(errorMsg);
			console.log(`[HWC] Session namespaces: ${hederaAccount}`);
			throw new Error(errorMsg);
		}

		console.log(`[HWC] Account ID retrieved: ${hederaAccount}`);


		const accountMirror = await this.mirrorNodeAdapter.getAccountInfo(
			hederaAccount,
		);

		if (!accountMirror) {
			const errorMsg = `❌ No account info retrieved from Mirror Node. Account ID: ${hederaAccount}`;
			console.log(errorMsg);
			throw new Error(errorMsg);
		}
		const accountId = accountMirror.id!;
		console.log(`[HWC] Account ID retrieved: ${accountId}`);

		console.log(`✅ [HWC] Account info retrieved from Mirror Node`);
		console.log(`[HWC] Account details: ${JSON.stringify(accountMirror, null, 2)}`)

		// Create account object and set network
		// Note: The signer will be created through HederaProvider methods
		this.account = new Account({
			id: accountId,
			publicKey: accountMirror.publicKey,
			evmAddress: accountMirror.accountEvmAddress,
		});
		this.network = currentNetwork;
		console.log(
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
		if (!this.hederaProvider) {
			console.log(
				`❌ Hedera WalletConnect not initialized. Cannot subscribe to events`,
			);
			return;
		}

		// Handle session deletions
		this.hederaProvider.on(
			'session_delete',
			async () => {
				console.log('📤 Session deleted event received');
				await this.stop();
			},
		);

		// Handle session updates
		this.hederaProvider.on(
			'session_update',
			async (event: any) => {
				console.log('🔄 Session updated event received', event);
			},
		);

		// Handle disconnect
		this.hederaProvider.on('disconnect', async () => {
			console.log('🔌 Disconnect event received');
			await this.stop();
		});

		// Subscribe to AppKit state changes
		if (this.appKit) {
			this.appKit.subscribeState((state: any) => {
				console.log(`[HWC] AppKit state changed: ${JSON.stringify(state)}`);
			});
		}
	}

	/**
	 * Stops the Hedera WalletConnect connection.
	 * @returns A promise that resolves to a boolean indicating whether the stop operation was successful.
	 */
	public async stop(): Promise<boolean> {
		try {
			if (this.hederaProvider) {
				await this.hederaProvider.disconnect();
			}
			if (this.appKit) {
				await this.appKit.disconnect();
			}
			this.hederaAdapter = undefined;
			this.appKit = undefined;
			this.hederaProvider = undefined;
			console.log(
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
				console.log(
					`🔍 No active session found for Hedera WalletConnect`,
				);
			} else {
				console.log(
					`❌ Error stopping Hedera WalletConnect: ${
						(error as Error).message
					}`,
				);
			}
			return Promise.resolve(false);
		}
	}

	public async signAndSendTransaction(
		transaction: Transaction,
		transactionType: TransactionType,
		nameFunction?: string | undefined,
		abi?: object[] | undefined,
	): Promise<TransactionResponse> {
		console.log(`🔏 Signing and sending transaction from HWC v2...`);
		this.ensureInitialized();

		// Verify session is still active
		if (!this.hederaProvider?.session) {
			throw new Error('❌ WalletConnect session is not active. Please reconnect.');
		}

		try {
			this.ensureTransactionFrozen(transaction);

			console.log(`🖋️ [HWC] Signing and executing transaction with HederaProvider...`);

			// Convert transaction to base64 and prepare params
			const transactionBase64 = transactionToBase64String(transaction);
			const ledgerId = this.networkService.environment === testnet ?
				LedgerId.TESTNET :
				LedgerId.MAINNET;

			const signerAccountId = ledgerIdToCAIPChainId(ledgerId) + ':' + this.account.id.toString();

			console.log(`[HWC] Signing with account: ${signerAccountId}`);
			console.log(`[HWC] Transaction base64 length: ${transactionBase64.length}`);


			/* TODO: ERROR
			 * TypeError: Cannot read properties of undefined (reading 'request')
				at HIP820Provider.request (bundle.js:873367:38)
				at HederaProvider.request (bundle.js:873492:81)
				at HederaProvider.hedera_signAndExecuteTransaction (bundle.js:873611:23)
				at HederaWalletConnectTransactionAdapter.signAndSendTransaction (bundle.js:867677:61)
				at HederaWalletConnectTransactionAdapter.contractCall (bundle.js:865650:23)
				at HederaWalletConnectTransactionAdapter.create (bundle.js:865145:25)
				at async CreateCommandHandler.execute (bundle.js:832079:17)
				at async StableCoinInPort.create (bundle.js:854784:28)
				at async LogError.descriptor.value (bundle.js:846606:22)
				at async SDKService.createStableCoin (bundle.js:949912:12)
			 */
			const ns = this.hederaProvider?.session?.namespaces
			if (!ns?.hedera) throw new Error('La sesión no tiene namespace "hedera" aprobado.')

			const transactionResponse = await this.hederaProvider!.hedera_signAndExecuteTransaction({
				signerAccountId,
				transactionList: transactionBase64,
			});

			// const signedTx = await this.hederaProvider!.eth_signMessage(
			// 	transactionBase64,
			// 	this.account.id.toString()
			// );

			// console.log(`[HWC] Transaction signed successfully. Signature length: ${signedTx.length}`);

			// const transactionResponse = await this.hederaProvider!.request(
			// 	{
			// 		method: 'hedera_signAndExecuteTransaction',
			// 		params: {
			// 			signerAccountId,
			// 			transactionList: transactionBase64,
			// 		},
			// 	},
			// 	ledgerIdToCAIPChainId(ledgerId),
			// );

			console.log(`✅ Transaction signed and sent successfully!`);
			console.log(
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
				console.log(error.stack);
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
			console.log(`🔒 Tx not frozen, freezing transaction...`);
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
		throw new Error('Method not implemented.');
		// console.log('🔏 Signing transaction from HWC v2...');
		// this.ensureInitialized();
		//
		// if (!(message instanceof Transaction))
		// 	throw new SigningError(
		// 		'❌ Hedera WalletConnect must sign a transaction not a string',
		// 	);
		//
		// if (
		// 	!this.networkService.consensusNodes ||
		// 	this.networkService.consensusNodes.length === 0
		// ) {
		// 	throw new Error(
		// 		'❌ In order to create sign multisignature transactions you must set consensus nodes for the environment',
		// 	);
		// }
		//
		// try {
		// 	this.ensureTransactionFrozen(message);
		//
		// 	console.log(`🖋️ [HWC] Signing transaction with HederaProvider...`);
		//
		// 	// Convert transaction to base64 and prepare params
		// 	const transactionBase64 = transactionToBase64String(message);
		// 	const ledgerId = this.networkService.environment === testnet ?
		// 		LedgerId.TESTNET :
		// 		LedgerId.MAINNET;
		// 	const signerAccountId = ledgerIdToCAIPChainId(ledgerId) + ':' + this.account.id.toString();
		//
		//
		//
		// 	const signedTransaction = await this.hederaProvider!.hedera_signTransaction({
		// 		signerAccountId,
		// 		transactionBody: transactionBase64,
		// 	});
		//
		// 	console.log(`✅ Transaction signed successfully!`);
		//
		// 	if (!signedTransaction) {
		// 		throw new Error(
		// 			'❌ No signed transaction returned from WalletConnect',
		// 		);
		// 	}
		//
		// 	const signatureMap = signedTransaction.getSignatures();
		//
		// 	const flatSigList = signatureMap.getFlatSignatureList();
		//
		// 	if (flatSigList.length === 0) {
		// 		throw new Error('No signatures found');
		// 	}
		//
		// 	const firstSigPair = flatSigList[0];
		//
		// 	const iterator = firstSigPair[Symbol.iterator]();
		// 	const firstEntry = iterator.next();
		//
		// 	if (firstEntry.done) {
		// 		throw new Error(
		// 			'No signatures found in first SignaturePairMap',
		// 		);
		// 	}
		//
		// 	const [, firstSignature] = firstEntry.value;
		//
		// 	if (!firstSignature) {
		// 		throw new Error('Signature is empty');
		// 	}
		//
		// 	const hexSignature = Hex.fromUint8Array(firstSignature);
		//
		// 	console.log(
		// 		`Final hexadecimal signature: ${JSON.stringify(
		// 			hexSignature,
		// 			null,
		// 			2,
		// 		)}`,
		// 	);
		//
		// 	return hexSignature;
		// } catch (error) {
		// 	throw new SigningError(JSON.stringify(error, null, 2));
		// }
	}
}
