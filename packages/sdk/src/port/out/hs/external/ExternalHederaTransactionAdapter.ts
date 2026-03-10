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

import {
	Transaction,
	TransactionId,
	AccountId,
	Timestamp,
	Client,
} from '@hiero-ledger/sdk';
import { singleton } from 'tsyringe';
import { lazyInject } from '../../../../core/decorator/LazyInjectDecorator.js';
import { BaseHederaTransactionAdapter } from '../BaseHederaTransactionAdapter.js';
import TransactionResponse, {
	TransactionMetadata,
} from '../../../../domain/context/transaction/TransactionResponse.js';
import { SupportedWallets } from '../../../../domain/context/network/Wallet.js';
import { TransactionType } from '../../TransactionResponseEnums.js';
import NetworkService from '../../../../app/service/NetworkService.js';
import { MirrorNodeAdapter } from '../../mirror/MirrorNodeAdapter.js';
import Account from '../../../../domain/context/account/Account.js';
import { InitializationData } from '../../TransactionAdapter.js';
import Injectable from '../../../../core/Injectable.js';
import {
	WalletEvents,
	WalletPairedEvent,
} from '../../../../app/service/event/WalletEvent.js';
import LogService from '../../../../app/service/LogService.js';
import EventService from '../../../../app/service/event/EventService.js';

@singleton()
export class ExternalHederaTransactionAdapter extends BaseHederaTransactionAdapter {
	private account: Account;
	private validStartOffsetMinutes = 0;

	constructor(
		@lazyInject(EventService)
		public readonly eventService: EventService,
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNodeAdapter: MirrorNodeAdapter,
		@lazyInject(NetworkService)
		public readonly networkService: NetworkService,
	) {
		super();
	}

	public setExternalWalletSettings(offsetMinutes = 0): void {
		this.validStartOffsetMinutes = offsetMinutes;
	}

	public async processTransaction(
		tx: Transaction,
		_transactionType: TransactionType,
		startDate?: string,
	): Promise<TransactionResponse> {
		try {
			const accountId = AccountId.fromString(
				this.account.id.toString(),
			);

			const validStartDate = startDate
				? new Date(startDate)
				: new Date(
						Date.now() +
							this.validStartOffsetMinutes * 60000,
					);

			const txId = TransactionId.withValidStart(
				accountId,
				Timestamp.fromDate(validStartDate),
			);
			tx.setTransactionId(txId).setTransactionValidDuration(180);

			const env = this.networkService.environment;
			let client: Client;
			if (env === 'mainnet') client = Client.forMainnet();
			else if (env === 'previewnet') client = Client.forPreviewnet();
			else client = Client.forTestnet();

			const serializedBytes = Buffer.from(
				tx.freezeWith(client).toBytes(),
			).toString('hex');

			const metadata: TransactionMetadata = {
				transactionType: tx.constructor.name,
				description: `${tx.constructor.name} operation`,
				requiredSigners: [this.account.id.toString()],
			};

			return new TransactionResponse(undefined, undefined, undefined, {
				serializedTransaction: serializedBytes,
				metadata,
			});
		} catch (error) {
			return new TransactionResponse(
				undefined,
				undefined,
				error as Error,
			);
		}
	}

	public getAccount(): Account {
		return this.account;
	}

	public supportsEvmOperations(): boolean {
		return false;
	}

	public getNetworkService(): NetworkService {
		return this.networkService;
	}

	public getMirrorNodeAdapter(): MirrorNodeAdapter {
		return this.mirrorNodeAdapter;
	}

	public getSupportedWallet(): SupportedWallets {
		return SupportedWallets.EXTERNAL_HEDERA;
	}

	init(): Promise<string> {
		this.eventService.emit(WalletEvents.walletInit, {
			wallet: SupportedWallets.EXTERNAL_HEDERA,
			initData: {},
		});
		LogService.logTrace('ExternalHederaTransactionAdapter Initialized');
		return Promise.resolve(this.networkService.environment);
	}

	async register(account: Account): Promise<InitializationData> {
		Injectable.registerTransactionHandler(this);

		const accountMirror = await this.mirrorNodeAdapter.getAccountInfo(
			account.id,
		);
		this.account = account;
		this.account.publicKey = accountMirror.publicKey;

		const eventData: WalletPairedEvent = {
			wallet: SupportedWallets.EXTERNAL_HEDERA,
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
		LogService.logTrace(
			'ExternalHederaTransactionAdapter registered as handler: ',
			eventData,
		);
		return Promise.resolve({
			account: this.getAccount(),
		});
	}

	stop(): Promise<boolean> {
		LogService.logTrace('ExternalHederaTransactionAdapter stopped');
		this.eventService.emit(WalletEvents.walletDisconnect, {
			wallet: SupportedWallets.EXTERNAL_HEDERA,
		});
		return Promise.resolve(true);
	}
}
