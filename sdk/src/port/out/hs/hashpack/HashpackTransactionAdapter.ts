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
	WalletPairedEvent,
} from '../../../../app/service/event/WalletEvent.js';
import { SupportedWallets } from '../../../in/request/ConnectRequest.js';
import { MirrorNodeAdapter } from '../../mirror/MirrorNodeAdapter.js';
import { SDK } from '../../../in/Common.js';

@singleton()
export class HashpackTransactionAdapter extends HederaTransactionAdapter {
	private hc: HashConnect;
	public account: Account;
	public topic: string;
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
		console.log(eventData);
		return this.networkService.environment;
	}

	async register(): Promise<InitializationData> {
		Injectable.registerTransactionHandler(this);
		this.hc.connectToLocalWallet();
		this.account = new Account({
			id: this.filterAccountIdFromPairingData(
				this.initData.savedPairings,
			),
		});
		const eventData: WalletPairedEvent = {
			data: {
				account: this.account,
				pairing: this.initData.pairingString,
				topic: this.initData.topic,
			},
			network: this.networkService.environment,
		};
		this.eventService.emit(WalletEvents.walletPaired, eventData);
		return Promise.resolve({
			account: this.account,
			pairing: this.initData.pairingString,
			savedPairings: this.initData.savedPairings,
			topic: this.initData.topic,
		});
	}

	private filterAccountIdFromPairingData(
		pairings: HashConnectTypes.SavedPairingData[],
	): string {
		const filtered = pairings.filter((x) => x.accountIds.length > 0);
		if (filtered.length === 0) throw new PairingError(filtered);
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
			await this.getAccountKey(); // Ensure we have the public key
			let signedT = t;
			if (!t.isFrozen()) {
				signedT = await t.freezeWithSigner(this.signer);
			}
			const trx = await this.signer.signTransaction(signedT);
			const HashPackTransactionResponse = await this.hc.sendTransaction(
				this.topic,
				{
					topic: this.topic,
					byteArray: trx.toBytes(),
					metadata: {
						accountToSign: this.signer.getAccountId().toString(),
						returnTransaction: false,
						getRecord: true,
					},
				},
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
		if (this.hashConnectSigner.getAccountKey) {
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
		if (this.account.id)
			return new Account({
				id: this.account.id.value,
			});
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
						id: this.pairingData.accountIds[0],
					});
					this.eventService.emit(WalletEvents.walletPaired, {
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
			this.eventService.emit(WalletEvents.walletConnectionStatusChanged, {
				status: this
					.hashConnectConectionState as unknown as ConnectionState,
			});
			this.state = state;
		});

		this.hc.acknowledgeMessageEvent.on((msg) => {
			this.eventService.emit(WalletEvents.walletAcknowledgeMessage, msg);
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
