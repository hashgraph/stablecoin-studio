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
	TransactionResponse as HTransactionResponse,
	Transaction,
	Client,
} from '@hashgraph/sdk';
import { singleton } from 'tsyringe';
import { HederaTransactionAdapter } from '../HederaTransactionAdapter.js';
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse.js';
import { TransactionType } from '../../TransactionResponseEnums.js';
import { HTSTransactionResponseAdapter } from './HTSTransactionResponseAdapter.js';
import Injectable from '../../../../core/Injectable.js';
import { InitializationData } from '../../TransactionAdapter.js';
import Account from '../../../../domain/context/account/Account.js';
import { Environment } from '../../../../domain/context/network/Environment.js';
import {
	WalletEvents,
	WalletPairedEvent,
} from '../../../../app/service/event/WalletEvent.js';
import { SupportedWallets } from '../../../in/request/ConnectRequest.js';
import EventService from '../../../../app/service/event/EventService.js';
import { lazyInject } from '../../../../core/decorator/LazyInjectDecorator.js';
import { MirrorNodeAdapter } from '../../mirror/MirrorNodeAdapter.js';
import NetworkService from '../../../../app/service/NetworkService.js';
import LogService from '../../../../app/service/LogService.js';
import { WalletConnectError } from '../../../../domain/context/network/error/WalletConnectError.js';
import { SigningError } from '../error/SigningError.js';

@singleton()
export class HTSTransactionAdapter extends HederaTransactionAdapter {
	private _client: Client;
	public network: Environment;
	public account: Account;

	public get client(): Client {
		return this._client;
	}

	constructor(
		@lazyInject(EventService) public readonly eventService: EventService,
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNodeAdapter: MirrorNodeAdapter,
		@lazyInject(NetworkService)
		public readonly networkService: NetworkService,
	) {
		super(mirrorNodeAdapter, networkService);
	}

	init(): Promise<string> {
		this.eventService.emit(WalletEvents.walletInit, {
			wallet: SupportedWallets.CLIENT,
			initData: {},
		});
		LogService.logTrace('Client Initialized');
		return Promise.resolve(this.networkService.environment);
	}

	async register(account: Account): Promise<InitializationData> {
		Injectable.registerTransactionHandler(this);

		const accountMirror = await this.mirrorNodeAdapter.getAccountInfo(
			account.id,
		);
		this.account = account;
		this.account.publicKey = accountMirror.publicKey;
		this.network = this.networkService.environment;
		this._client = Client.forName(this.networkService.environment);
		const id = this.account.id?.value ?? '';
		if (!account.privateKey)
			throw new WalletConnectError(
				'A private key is needed for the account',
			);
		const privateKey = account.privateKey.toHashgraphKey();
		this._client.setOperator(id, privateKey);
		const eventData: WalletPairedEvent = {
			wallet: SupportedWallets.HASHPACK,
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
		LogService.logTrace('Client registered as handler: ', eventData);
		return Promise.resolve({
			account: this.getAccount(),
		});
	}

	stop(): Promise<boolean> {
		this.client?.close();
		LogService.logTrace('Client stopped');
		this.eventService.emit(WalletEvents.walletDisconnect, {
			wallet: SupportedWallets.CLIENT,
		});
		return Promise.resolve(true);
	}

	public async signAndSendTransaction(
		t: Transaction,
		transactionType: TransactionType,
		functionName: string,
		abi: object[],
	): Promise<TransactionResponse> {
		const tr: HTransactionResponse = await t.execute(this.client);
		this.logTransaction(
			tr.transactionId.toString(),
			this.networkService.environment,
		);
		return HTSTransactionResponseAdapter.manageResponse(
			this.networkService.environment,
			tr,
			transactionType,
			this.client,
			functionName,
			abi,
		);
	}

	getAccount(): Account {
		return this.account;
	}

	async sign(message: string): Promise<string> {
		if (!this.account.privateKey)
			throw new SigningError('Private Key is empty');

		try {
			return 'Signed message';
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(error);
		}
	}
}
