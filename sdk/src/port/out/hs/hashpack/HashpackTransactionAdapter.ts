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

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	Transaction,
	Signer,
	PublicKey as HPublicKey,
	TokenBurnTransaction,
	TokenCreateTransaction,
	TokenDeleteTransaction,
	TokenFreezeTransaction,
	TokenMintTransaction,
	TokenPauseTransaction,
	TokenUnfreezeTransaction,
	TokenUnpauseTransaction,
	TokenWipeTransaction,
	TransferTransaction,
	TokenRevokeKycTransaction,
	TokenGrantKycTransaction,
	TokenFeeScheduleUpdateTransaction,
	TokenAssociateTransaction,
} from '@hashgraph/sdk';
import { singleton } from 'tsyringe';
import { HederaTransactionAdapter } from '../HederaTransactionAdapter.js';
import { HashConnect } from '@hashgraph-dev/hashconnect';
import { HashConnectProvider } from '@hashgraph-dev/hashconnect/provider/provider';
import { HashConnectSigner } from '@hashgraph-dev/hashconnect/provider/signer';
import { HashConnectTypes } from '@hashgraph-dev/hashconnect';
import { HashConnectConnectionState } from '@hashgraph-dev/hashconnect/types';
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
import { HederaId } from '../../../../domain/context/shared/HederaId.js';
import { QueryBus } from '../../../../core/query/QueryBus.js';
import { AccountIdNotValid } from '../../../../domain/context/account/error/AccountIdNotValid.js';
import { GetAccountInfoQuery } from '../../../../app/usecase/query/account/info/GetAccountInfoQuery.js';

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
		@lazyInject(QueryBus)
		public readonly queryBus: QueryBus,
	) {
		super(mirrorNodeAdapter, networkService);
		this.hc = new HashConnect();
		this.setUpHashConnectEvents();
	}

	async init(network?: string): Promise<string> {
		const currentNetwork = network ?? this.networkService.environment;
		this.initData = await this.hc.init(
			SDK.appMetadata,
			currentNetwork as 'testnet' | 'previewnet' | 'mainnet',
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
			this.account = await this.getAccountInfo(
				this.initData.savedPairings[0].accountIds[0],
			);
			eventData.initData.account = this.account;
			this.eventService.emit(WalletEvents.walletPaired, {
				data: eventData.initData,
				network: {
					name: currentNetwork,
					recognized: true,
					factoryId: this.networkService.configuration
						? this.networkService.configuration.factoryAddress
						: '',
				},
				wallet: SupportedWallets.HASHPACK,
			});
			this.setSigner(currentNetwork);
			LogService.logTrace(
				'Previous paring found: ',
				this.account,
				eventData,
			);
		}
		LogService.logTrace('HashPack Initialized ', eventData);
		return currentNetwork;
	}

	private async setSigner(network: string): Promise<void> {
		this.hashConnectSigner = await this.hc.getSignerWithAccountKey(
			this.hc.getProvider(
				network as 'testnet' | 'previewnet' | 'mainnet',
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
				network: {
					name: this.networkService.environment,
					recognized: true,
					factoryId: this.networkService.configuration
						? this.networkService.configuration.factoryAddress
						: '',
				},
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
		await this.hc.clearConnectionsAndData();
		LogService.logTrace('HashPack stopped');
		this.eventService.emit(WalletEvents.walletDisconnect, {
			wallet: SupportedWallets.HASHPACK,
		});
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
			LogService.logTrace(
				'HashPack is singing and sending transaction:',
				nameFunction,
				t,
			);
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
			let hashPackTransactionResponse;
			if (
				t instanceof TokenCreateTransaction ||
				t instanceof TokenWipeTransaction ||
				t instanceof TokenBurnTransaction ||
				t instanceof TokenMintTransaction ||
				t instanceof TokenPauseTransaction ||
				t instanceof TokenUnpauseTransaction ||
				t instanceof TokenDeleteTransaction ||
				t instanceof TokenFreezeTransaction ||
				t instanceof TokenUnfreezeTransaction ||
				t instanceof TokenGrantKycTransaction ||
				t instanceof TokenRevokeKycTransaction ||
				t instanceof TransferTransaction ||
				t instanceof TokenFeeScheduleUpdateTransaction ||
				t instanceof TokenAssociateTransaction
			) {
				hashPackTransactionResponse = await t.executeWithSigner(
					this.signer,
				);
				this.logTransaction(
					JSON.parse(
						JSON.stringify(hashPackTransactionResponse),
					).response.transactionId.toString(),
					this.networkService.environment,
				);
			} else {
				hashPackTransactionResponse = await this.hc.sendTransaction(
					this.initData.topic,
					hashPackTrx,
				);
				this.logTransaction(
					hashPackTransactionResponse.response
						? (hashPackTransactionResponse.response as any)
								.transactionId ?? ''
						: (hashPackTransactionResponse.error as any)
								.transactionId ?? '',
					this.networkService.environment,
				);
			}
			return HashpackTransactionResponseAdapter.manageResponse(
				this.networkService.environment,
				this.signer,
				hashPackTransactionResponse,
				transactionType,
				nameFunction,
				abi,
			);
		} catch (error) {
			LogService.logError(error);
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

	public async restart(network: string): Promise<void> {
		await this.stop();
		this.hc = new HashConnect();
		this.setUpHashConnectEvents();
		await this.init(network);
	}

	public setUpHashConnectEvents(): void {
		//This is fired when a extension is found
		this.hc.foundExtensionEvent.on((data) => {
			if (data) {
				LogService.logTrace('Found HashPack Extension Event: ', data);
				this.availableExtension = true;
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
					LogService.logInfo('Paired HashPack Wallet Event: ', data);
					const id = data.pairingData.accountIds[0];
					this.account = await this.getAccountInfo(id);
					this.setSigner(this.networkService.environment);
					this.eventService.emit(WalletEvents.walletPaired, {
						wallet: SupportedWallets.HASHPACK,
						data: {
							account: this.account,
							pairing: this.initData.pairingString,
							topic: this.pairingData.topic,
						},
						network: {
							name: this.pairingData.network,
							recognized: true,
							factoryId: this.networkService.configuration
								? this.networkService.configuration
										.factoryAddress
								: '',
						},
					});
				} else {
					throw new PairingError(data);
				}
			} catch (error) {
				LogService.logError(error);
				throw new PairingError(error);
			}
		});

		//This is fired when HashConnect loses connection, pairs successfully, or is starting connection
		this.hc.connectionStatusChangeEvent.on((state) => {
			this.hashConnectConectionState = state;
			LogService.logTrace('HashPack Connection Status Event: ', state);
			if (state === HashConnectConnectionState.Disconnected) {
				this.eventService.emit(WalletEvents.walletDisconnect, {
					wallet: SupportedWallets.HASHPACK,
				});
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

	async getAccountInfo(id: string): Promise<Account> {
		const account = (
			await this.queryBus.execute(
				new GetAccountInfoQuery(HederaId.from(id)),
			)
		).account;
		if (!account.id) throw new AccountIdNotValid(id.toString());
		return new Account({
			id: account.id,
			publicKey: account.publicKey,
			evmAddress: account.accountEvmAddress,
		});
	}
}
