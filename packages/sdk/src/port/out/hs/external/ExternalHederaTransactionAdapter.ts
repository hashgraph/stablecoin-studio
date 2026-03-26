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
import { AbstractNetworkService } from '../../../../core/service/AbstractNetworkService.js';
import { AbstractMirrorNodeAdapter } from '../../mirror/AbstractMirrorNodeAdapter.js';
import Account from '../../../../domain/context/account/Account.js';
import { InitializationData } from '../../TransactionAdapter.js';
import Injectable from '../../../../core/Injectable.js';
import {
	WalletEvents,
	WalletPairedEvent,
} from '../../../../domain/context/event/WalletEvent.js';
import LogService from '../../../../core/service/LogService.js';
import { AbstractEventService } from '../../../../core/service/AbstractEventService.js';
import type { SigningConfig } from '../../../../core/config/SigningConfig.js';

@singleton()
export class ExternalHederaTransactionAdapter extends BaseHederaTransactionAdapter {
	private account: Account;
	private validStartOffsetMinutes = 0;

	constructor(
		@lazyInject(AbstractEventService)
		public readonly eventService: AbstractEventService,
		@lazyInject(AbstractMirrorNodeAdapter)
		public readonly mirrorNodeAdapter: AbstractMirrorNodeAdapter,
		@lazyInject(AbstractNetworkService)
		public readonly networkService: AbstractNetworkService,
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

	public getNetworkService(): AbstractNetworkService {
		return this.networkService;
	}

	public getMirrorNodeAdapter(): AbstractMirrorNodeAdapter {
		return this.mirrorNodeAdapter;
	}

	toSigningConfig(): SigningConfig {
		const env = this.networkService.environment;
		let client: Client;
		if (env === 'mainnet') client = Client.forMainnet();
		else if (env === 'previewnet') client = Client.forPreviewnet();
		else client = Client.forTestnet();

		return {
			type: 'hedera-external',
			client,
			accountId: this.getAccount().id.toString(),
			sign: async (bytes: Uint8Array) => {
				// Delegate to the external wallet's sign capability
				const hex = Buffer.from(bytes).toString('hex');
				const signedHex = await this.sign(hex);
				return Buffer.from(signedHex, 'hex');
			},
		};
	}

	public getSupportedWallet(): SupportedWallets {
		return SupportedWallets.EXTERNAL_HEDERA;
	}

	public isExternal(): boolean {
		return true;
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
