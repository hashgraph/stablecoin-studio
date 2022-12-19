/* eslint-disable @typescript-eslint/no-explicit-any */
import { Transaction, Signer, PublicKey as HPublicKey } from '@hashgraph/sdk';
import { singleton } from 'tsyringe';
import { HederaTransactionAdapter } from '../HederaTransactionAdapter.js';
import { HashConnect } from 'hashconnect';
import { HashConnectProvider } from 'hashconnect/provider/provider';
import { HashConnectSigner } from 'hashconnect/provider/signer';
import { HashConnectTypes } from 'hashconnect';
import { HashConnectConnectionState } from 'hashconnect/types';
import Account from '../../../../domain/context/account/Account.js';
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse.js';
import Injectable from '../../../../core/Injectable.js';
import { SigningError } from '../error/SigningError.js';
import { HashpackTransactionResponseAdapter } from './HashpackTransactionResponseAdapter.js';
import { TransactionType } from '../../TransactionResponseEnums.js';
import LogService from '../../../../app/service/LogService.js';
import EventService from '../../../../app/service/event/EventService.js';
import { PairingError } from './error/PairingError.js';
import { InitializationData } from '../../TransactionAdapter.js';
import { lazyInject } from '../../../../core/decorator/LazyInjectDecorator.js';
import NetworkService from '../../../../app/service/NetworkService.js';
import { RuntimeError } from '../../../../core/error/RuntimeError.js';
import {
	ConnectionState,
	WalletEvents,
	WalletInitEvent,
} from '../../../../app/service/event/WalletEvent.js';
import { SupportedWallets } from '../../../in/request/ConnectRequest.js';
import { MirrorNodeAdapter } from '../../mirror/MirrorNodeAdapter.js';
import { SDK } from '../../../in/Common.js';

@singleton()
export class HashpackTransactionAdapter extends HederaTransactionAdapter {
	private hc: HashConnect;
	public account: Account;
	public provider: HashConnectProvider;
	public signer: Signer;
	public hashConnectSigner: HashConnectSigner;
	private initData: HashConnectTypes.InitilizationData;
	private hashConnectConectionState: HashConnectConnectionState;
	private availableExtension = false;
	private pairingData: HashConnectTypes.SavedPairingData | null = null;
	state: HashConnectConnectionState;

	constructor(
		@lazyInject(EventService)
		public readonly eventService: EventService,
		@lazyInject(NetworkService)
		public readonly networkService: NetworkService,
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNodeAdapter: MirrorNodeAdapter,
	) {
		super(mirrorNodeAdapter);
		this.hc = new HashConnect();
		this.setUpHashConnectEvents();
	}

	async init(): Promise<string> {
		this.initData = await this.hc.init(
			SDK.appMetadata,
			this.networkService.environment as
				| 'testnet'
				| 'previewnet'
				| 'mainnet',
		);
		const eventData: WalletInitEvent = {
			wallet: SupportedWallets.HASHPACK,
			initData: {
				account: this.account,
				pairing: this.initData.pairingString,
				topic: this.initData.topic,
			},
		};
		this.eventService.emit(WalletEvents.walletInit, eventData);
		LogService.logTrace(
			'Checking for previously saved pairings: ',
			this.initData.savedPairings,
		);
		if (this.initData.savedPairings.length > 0) {
			this.account = new Account({
				id: this.initData.savedPairings[0].accountIds[0],
			});
			eventData.initData.account = this.account;
			this.eventService.emit(WalletEvents.walletPaired, {
				data: eventData.initData,
				network: this.networkService.environment,
				wallet: SupportedWallets.HASHPACK,
			});
			this.setSigner();
			LogService.logTrace(
				'Previous paring found: ',
				this.account,
				eventData,
			);
		}
		LogService.logTrace('HashPack Initialized ', eventData);
		return this.networkService.environment;
	}

	private async setSigner(): Promise<void> {
		this.hashConnectSigner = await this.hc.getSignerWithAccountKey(
			this.hc.getProvider(
				this.networkService.environment as
					| 'testnet'
					| 'previewnet'
					| 'mainnet',
				this.initData.topic,
				this.account.id.toString(),
			),
		);
		this.signer = this.hashConnectSigner;
		await this.getAccountKey();
	}

	async register(): Promise<InitializationData> {
		Injectable.registerTransactionHandler(this);
		LogService.logTrace('HashPack Registered as handler');
		const savedPairing = this.filterAccountIdFromPairingData(
			this.initData.savedPairings,
		);
		if (!this.account || !savedPairing) {
			LogService.logTrace('Asking for new pairing', {
				account: this.account,
				savedPairing,
			});
			this.hc.connectToLocalWallet();
		} else if (
			this.account &&
			savedPairing &&
			this.account.id.toString() === savedPairing
		) {
			this.eventService.emit(WalletEvents.walletPaired, {
				wallet: SupportedWallets.HASHPACK,
				data: {
					account: this.account,
					pairing: this.initData.pairingString,
					topic: this.initData.topic,
				},
				network: this.networkService.environment,
			});
		}
		return Promise.resolve({
			name: SupportedWallets.HASHPACK,
			account: this.account,
			pairing: this.initData.pairingString,
			savedPairings: this.initData.savedPairings,
			topic: this.initData.topic,
		});
	}

	private filterAccountIdFromPairingData(
		pairings: HashConnectTypes.SavedPairingData[],
	): string | undefined {
		const filtered = pairings.filter((x) => x.accountIds.length > 0);
		if (filtered.length === 0) return undefined;
		return filtered[0].accountIds[0];
	}

	async stop(): Promise<boolean> {
		await this.hc.disconnect(this.initData.topic);
		return Promise.resolve(true);
	}

	async signAndSendTransaction(
		t: Transaction,
		transactionType: TransactionType,
		nameFunction?: string,
		abi?: any[],
	): Promise<TransactionResponse> {
		if (!this.signer) throw new SigningError('Signer is empty');
		try {
			await this.getAccountKey(); // Ensure we have the public key)
			let signedT = t;
			if (!t.isFrozen()) {
				signedT = await t.freezeWithSigner(this.signer);
			}
			const trx = await this.signer.signTransaction(signedT);
			const hashPackTrx = {
				topic: this.initData.topic,
				byteArray: trx.toBytes(),
				metadata: {
					accountToSign: this.account.id.toString(),
					returnTransaction: false,
					getRecord: true,
				},
			};
			const HashPackTransactionResponse = await this.hc.sendTransaction(
				this.initData.topic,
				hashPackTrx,
			);

			return HashpackTransactionResponseAdapter.manageResponse(
				HashPackTransactionResponse,
				transactionType,
				nameFunction,
				abi,
			);
		} catch (error) {
			throw new SigningError(error);
		}
	}

	async getAccountKey(): Promise<HPublicKey> {
		if (this.hashConnectSigner?.getAccountKey) {
			return this.hashConnectSigner.getAccountKey();
		}
		this.hashConnectSigner = await this.hc.getSignerWithAccountKey(
			this.provider,
		);
		this.signer = this.hashConnectSigner as unknown as Signer;
		if (this.hashConnectSigner.getAccountKey) {
			return this.hashConnectSigner.getAccountKey();
		} else {
			throw new SigningError('Public key is empty');
		}
	}

	getAccount(): Account {
		if (this.account) return this.account;
		throw new RuntimeError(
			'There are no accounts currently paired with HashPack!',
		);
	}
	public setUpHashConnectEvents(): void {
		//This is fired when a extension is found
		this.hc.foundExtensionEvent.on((data) => {
			LogService.logTrace('Found extension', data);
			if (data) {
				this.availableExtension = true;
				LogService.logTrace('Emitted found');
				this.eventService.emit(WalletEvents.walletFound, {
					wallet: SupportedWallets.HASHPACK,
					name: SupportedWallets.HASHPACK,
				});
			}
		});

		//This is fired when a wallet approves a pairing
		this.hc.pairingEvent.on(async (data) => {
			try {
				if (data.pairingData) {
					this.pairingData = data.pairingData;
					LogService.logInfo('Paired with wallet', data);
					this.account = new Account({
						id: data.pairingData.accountIds[0],
					});
					this.setSigner();
					this.eventService.emit(WalletEvents.walletPaired, {
						wallet: SupportedWallets.HASHPACK,
						data: {
							account: this.account,
							pairing: this.initData.pairingString,
							topic: this.pairingData.topic,
						},
						network: this.pairingData.network,
					});
				} else {
					throw new PairingError(data);
				}
			} catch (error) {
				throw new PairingError(error);
			}
		});

		//This is fired when HashConnect loses connection, pairs successfully, or is starting connection
		this.hc.connectionStatusChangeEvent.on((state) => {
			this.hashConnectConectionState = state;
			LogService.logTrace('hashconnect state change event', state);
			if (state === HashConnectConnectionState.Disconnected) {
				this.eventService.emit(WalletEvents.walletDisconnect);
			}
			this.eventService.emit(WalletEvents.walletConnectionStatusChanged, {
				wallet: SupportedWallets.HASHPACK,
				status: this
					.hashConnectConectionState as unknown as ConnectionState,
			});

			this.state = state;
		});

		this.hc.acknowledgeMessageEvent.on((msg) => {
			this.eventService.emit(WalletEvents.walletAcknowledgeMessage, {
				wallet: SupportedWallets.HASHPACK,
				result: !!msg,
			});
		});
	}

	getAvailabilityExtension(): boolean {
		return this.availableExtension;
	}

	gethashConnectConectionState(): HashConnectConnectionState {
		return this.hashConnectConectionState;
	}

	disconectHaspack(): void {
		if (this.initData?.topic) this.hc.disconnect(this.initData.topic);

		this.pairingData = null;
		this.eventService.emit(WalletEvents.walletDisconnect);
	}
}
