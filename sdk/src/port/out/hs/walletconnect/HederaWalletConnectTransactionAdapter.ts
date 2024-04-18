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
import { LedgerId, Transaction } from '@hashgraph/sdk';
import { NetworkName } from '@hashgraph/sdk/lib/client/Client';
import { DAppConnector } from '@hashgraph/hedera-wallet-connect';
import { SignClientTypes } from '@walletconnect/types';
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
import { Environment } from '../../../../domain/context/network/Environment';
import { SupportedWallets } from '../../../../domain/context/network/Wallet';
import HWCSettings from '../../../../domain/context/hwalletconnectsettings/HWCSettings.js';

@singleton()
/**
 * Represents a transaction adapter for Hedera Wallet Connect.
 */
export class HederaWalletConnectTransactionAdapter extends HederaTransactionAdapter {
	public account: Account;
	protected network: Environment;
	protected dAppConnector: DAppConnector | undefined;
	protected projectId: string;
	protected dappMetadata: SignClientTypes.Metadata;

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
			throw new Error('hedera wallet conenct settings not set');

		this.projectId = hWCSettings.projectId ?? '';
		this.dappMetadata = {
			name: hWCSettings.dappName ?? '',
			description: hWCSettings.dappDescription ?? '',
			url: hWCSettings.dappURL ?? '',
			icons: [],
		};

		await this.connectWalletConnect();

		return Promise.resolve({
			account: this.getAccount(),
		});
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

		try {
			const hwcNetwork = this.getLedgerId(currentNetwork);
			// Create dApp Connector instance
			this.dAppConnector = new DAppConnector(
				this.dappMetadata,
				hwcNetwork,
				this.projectId,
			);
			await this.dAppConnector.init({ logger: 'debug' });
			LogService.logTrace(
				`✅ HWC Initialized with network: ${currentNetwork} and projectId: ${this.projectId}`,
			);
		} catch (error: any) {
			LogService.logTrace(
				'❌ Error initializing HWC with network: ${currentNetwork} and projectId: ${projectId}',
				error,
			);
			return currentNetwork;
		}

		LogService.logTrace('🔗 Pairing with Hedera WalletConnect...');
		// Scan QR code or use WalletConnect URI to connect
		await this.dAppConnector.connectQR();
		// await this.dAppConnector.openModal(); // TODO check
		// Get signers from WalletConnect
		const walletConnectSigners = this.dAppConnector.signers;
		if (!walletConnectSigners) {
			throw new Error(
				`❌ No signers retrieved from wallet connect. Signers: ${walletConnectSigners}`,
			);
		}
		// Get account ID from signers
		const accountId = walletConnectSigners[0].getAccountId().toString();
		if (!accountId) {
			throw new Error(
				`❌ No account ID retrieved from signers. Account ID: ${accountId}`,
			);
		}
		// Get account info from Mirror Node
		const accountMirror = await this.mirrorNodeAdapter.getAccountInfo(
			accountId,
		);
		if (!accountMirror) {
			throw new Error(
				`❌ No account info retrieved from Mirror Node. Account ID: ${accountId}`,
			);
		}
		// Create account object and set network
		this.account = new Account({
			id: accountId,
			publicKey: accountMirror.publicKey,
			evmAddress: accountMirror.accountEvmAddress,
		});
		this.network = this.networkService.environment;
		LogService.logInfo(
			`✅ Hedera WalletConnect paired with account: ${accountId}`,
		);
		const eventData: WalletPairedEvent = {
			wallet: SupportedWallets.HWALLETCONNECT,
			data: {
				account: this.account,
				pairing: '',
				topic: '',
			},
			network: {
				name: this.networkService.environment,
				recognized: true,
				factoryId: this.networkService.configuration
					? this.networkService.configuration.factoryAddress
					: '',
			},
		};
		this.eventService.emit(WalletEvents.walletPaired, eventData);

		return currentNetwork;
	}

	/**
	 * Stops the Hedera WalletConnect connection.
	 * @returns A promise that resolves to a boolean indicating whether the stop operation was successful.
	 */
	public async stop(): Promise<boolean> {
		try {
			await this.dAppConnector?.disconnectAll();
			this.dAppConnector = undefined;
			LogService.logInfo(
				`🛑 🏁 Hedera WalletConnect stopped successfully`,
			);
			this.eventService.emit(WalletEvents.walletDisconnect, {
				wallet: SupportedWallets.HWALLETCONNECT,
			});
			return Promise.resolve(true);
		} catch (error: any) {
			if (
				(error.message as string).includes('No active session') ||
				(error.message as string).includes('No matching key')
			) {
				LogService.logInfo(
					`🔍 No active session found for Hedera WalletConnect`,
				);
			} else {
				LogService.logError(
					`❌ Error stopping Hedera WalletConnect: ${error.message}`,
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

	// async function hedera_signAndExecuteTransaction(_: Event) {
	// 	const transaction = new TransferTransaction()
	// 		.setTransactionId(TransactionId.generate(getState('sign-send-from')))
	// 		.addHbarTransfer(getState('sign-send-from'), new Hbar(-getState('sign-send-amount')))
	// 		.addHbarTransfer(getState('sign-send-to'), new Hbar(+getState('sign-send-amount')))
	//
	// 	const params: SignAndExecuteTransactionParams = {
	// 		transactionList: transactionToBase64String(transaction),
	// 		signerAccountId: 'hedera:testnet:' + getState('sign-send-from'),
	// 	}
	//
	// 	console.log(params)
	//
	// 	return await dAppConnector!.signAndExecuteTransaction(params)
	// }

	public async signAndSendTransaction(
		t: Transaction,
		transactionType: TransactionType,
		nameFunction?: string | undefined,
		abi?: any[] | undefined,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}

	getAccount(): Account {
		return this.account;
	}
	sign(message: string | Transaction): Promise<string> {
		throw new Error('Method not implemented.');
	}

	getWCMetadata(): SignClientTypes.Metadata {
		return this.dappMetadata;
	}

	getProjectId(): string {
		return this.projectId;
	}

	private getLedgerId(network: string): LedgerId {
		switch (network) {
			case 'testnet':
				return LedgerId.TESTNET;
			case 'previewnet':
				return LedgerId.PREVIEWNET;
			default:
				return LedgerId.MAINNET;
		}
	}
}
