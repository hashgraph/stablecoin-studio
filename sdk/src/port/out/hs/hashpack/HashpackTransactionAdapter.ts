import { Transaction, Signer, PublicKey as HPublicKey } from '@hashgraph/sdk';
import { singleton } from 'tsyringe';
import { HederaTransactionAdapter } from '../HederaTransactionAdapter.js';
import { HashConnect } from 'hashconnect';
import { HashConnectProvider } from 'hashconnect/provider/provider';
import { HashConnectSigner } from 'hashconnect/provider/signer';
import { HashConnectTypes } from 'hashconnect';
import { HashConnectConnectionState, NetworkType } from 'hashconnect/types';
import Account from '../../../../domain/context/account/Account.js';
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse.js';
import { Injectable } from '../../../../core/Injectable.js';
import { SigningError } from '../error/SigningError.js';
import { HashpackTransactionResponseAdapter } from './HashpackTransactionResponseAdapter.js';
import { TransactionType } from '../../TransactionResponseEnums.js';
import LogService from '../../../../app/service/LogService.js';
import EventService from '../../../../app/service/event/EventService.js';
import { HaspackEventNames } from './HaspackProviderEvent.js';
import { PairingError } from './error/PairingError.js';

@singleton()
export class HashpackTransactionAdapter extends HederaTransactionAdapter {
	private hc: HashConnect;
	public account: Account;
	public topic: string;
	public provider: HashConnectProvider;
	public signer: Signer;
	public hashConnectSigner: HashConnectSigner;
	private _initData: HashConnectTypes.InitilizationData;
	public eventService: EventService;
	private hashConnectConectionState: HashConnectConnectionState;
	private availableExtension = false;
	private pairingData: HashConnectTypes.SavedPairingData | null = null;


	public get initData(): HashConnectTypes.InitilizationData {
		return this._initData;
	}
	public set initData(value: HashConnectTypes.InitilizationData) {
		this._initData = value;
	}

	constructor(eventService: EventService) {
		super();
		this.hc = new HashConnect();
		this.eventService = eventService;
	}

	register(): boolean {
		return !!Injectable.registerTransactionHandler(this);
	}
	stop(): Promise<boolean> {
		return Promise.resolve(!!Injectable.disposeTransactionHandler(this));
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

	getAccount(): string {
		if (this.account.id) return this.account.id.value;
		return '';
	}
	public setUpHashConnectEvents(): void {
		//This is fired when a extension is found
		this.hc.foundExtensionEvent.on((data) => {
			LogService.logTrace('Found extension', data);
			if (data) {
				this.availableExtension = true;
				LogService.logTrace(
					'Emitted found',
					this.eventService.emit(
						HaspackEventNames.providerFoundExtensionEvent,
					),
				);
			}
		});

		//This is fired when a wallet approves a pairing
		this.hc.pairingEvent.on(async (data) => {
			try {
				if (data.pairingData) {
					this.pairingData = data.pairingData;
					LogService.logInfo('Paired with wallet', data);
					this.eventService.emit(
						HaspackEventNames.providerPairingEvent,
						this.pairingData,
					);
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
			this.eventService.emit(
				HaspackEventNames.providerConnectionStatusChangeEvent,
				this.hashConnectConectionState,
			);
			// this.state = state;
		});

		this.hc.acknowledgeMessageEvent.on((msg) => {
			this.eventService.emit(
				HaspackEventNames.providerAcknowledgeMessageEvent,
				msg,
			);
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
		this.eventService.emit(
			HaspackEventNames.providerConnectionStatusChangeEvent,
			HashConnectConnectionState.Disconnected,
		);
	}

}
