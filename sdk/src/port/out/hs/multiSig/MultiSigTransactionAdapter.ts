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
import { HederaTransactionAdapter } from '../HederaTransactionAdapter.js';
import {
	AccountId,
	Client,
	Timestamp,
	Transaction,
	TransactionId,
} from '@hashgraph/sdk';
import Account from '../../../../domain/context/account/Account.js';
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse.js';
import { lazyInject } from '../../../../core/decorator/LazyInjectDecorator.js';
import NetworkService from '../../../../app/service/NetworkService.js';
import { MirrorNodeAdapter } from '../../mirror/MirrorNodeAdapter.js';
import { BackendAdapter } from '../../backend/BackendAdapter.js';
import { SupportedWallets } from '../../../../domain/context/network/Wallet';
import {
	Environment,
	previewnet,
	mainnet,
} from '../../../../domain/context/network/Environment';
import Injectable from '../../../../core/Injectable.js';
import { InitializationData } from '../../TransactionAdapter.js';
import LogService from '../../../../app/service/LogService.js';
import {
	WalletEvents,
	WalletPairedEvent,
} from '../../../../app/service/event/WalletEvent.js';
import EventService from '../../../../app/service/event/EventService.js';
import Hex from '../../../../core/Hex.js';
import TransactionService from '../../../../app/service/TransactionService.js';
import { TransactionType } from '../../TransactionResponseEnums';

@singleton()
export class MultiSigTransactionAdapter extends HederaTransactionAdapter {
	public account: Account;
	protected network: Environment;

	constructor(
		@lazyInject(EventService) public readonly eventService: EventService,
		@lazyInject(NetworkService)
		public readonly networkService: NetworkService,
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNodeAdapter: MirrorNodeAdapter,
		@lazyInject(BackendAdapter)
		public readonly backendAdapter: BackendAdapter,
	) {
		super(mirrorNodeAdapter, networkService);
	}

	async signAndSendTransaction(
		t: Transaction,
		transactionType: TransactionType,
		nameFunction?: string,
		abi?: never[],
		startDate?: string,
	): Promise<TransactionResponse<never, Error>> {
		const publicKeys: string[] = [];

		const accountId: AccountId = AccountId.fromString(
			this.account.id.toString(),
		);

		const dateStr = startDate ? startDate : new Date().toISOString();

		const validStart = Timestamp.fromDate(dateStr);
		const txId = TransactionId.withValidStart(accountId, validStart);

		t.setTransactionId(txId);
		t.setTransactionValidDuration(180);
		t._freezeWithAccountId(accountId);

		let client: Client = Client.forTestnet();

		if (this.networkService.environment == previewnet) {
			client = Client.forPreviewnet();
		} else if (this.networkService.environment == mainnet) {
			client = Client.forMainnet();
		}

		if (
			!this.networkService.consensusNodes ||
			this.networkService.consensusNodes.length == 0
		) {
			throw new Error(
				'In order to create multisignature transactions you must set consensus nodes for the environment',
			);
		}

		client.setNetwork({
			[this.networkService.consensusNodes[0].url]:
				this.networkService.consensusNodes[0].nodeId,
		});

		if (!this.account.multiKey) {
			throw new Error('MultiKey not found in the account');
		}

		this.account.multiKey.keys.forEach((key) => publicKeys.push(key.key));

		const transactionDescription = await TransactionService.getDescription(
			t,
			this.mirrorNodeAdapter,
		);

		const transactionId = await this.backendAdapter.addTransaction(
			Hex.fromUint8Array(t.freezeWith(client).toBytes()),
			transactionDescription,
			this.account.id.toString(),
			publicKeys,
			this.account.multiKey.threshold,
			this.networkService.environment,
			new Date(dateStr),
		);

		return new TransactionResponse(transactionId);
	}

	// ! MultiSig cannot be used to sign anything
	sign(): Promise<string> {
		throw new Error('Method not implemented.');
	}

	getSupportedWallet(): SupportedWallets {
		return SupportedWallets.MULTISIG;
	}

	init(): Promise<string> {
		this.eventService.emit(WalletEvents.walletInit, {
			wallet: SupportedWallets.MULTISIG,
			initData: {},
		});
		LogService.logTrace('Multisig Initialized');
		return Promise.resolve(this.networkService.environment);
	}

	async register(account: Account): Promise<InitializationData> {
		Injectable.registerTransactionHandler(this);
		LogService.logTrace('MultiSig Registered as handler');

		const accountMirror = await this.mirrorNodeAdapter.getAccountInfo(
			account.id,
		);
		if (!accountMirror.multiKey) {
			throw new Error('multiKey not found in the mirror node');
		}

		this.account = account;
		this.account.publicKey = accountMirror.publicKey;
		this.account.multiKey = accountMirror.multiKey;
		this.account.evmAddress = accountMirror.accountEvmAddress;

		this.network = this.networkService.environment;

		const eventData: WalletPairedEvent = {
			wallet: SupportedWallets.MULTISIG,
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
		LogService.logTrace('Multisig registered as handler: ', eventData);
		return Promise.resolve({
			account: this.getAccount(),
		});
	}

	stop(): Promise<boolean> {
		LogService.logTrace('MultiSig stopped');
		this.eventService.emit(WalletEvents.walletDisconnect, {
			wallet: SupportedWallets.MULTISIG,
		});
		return Promise.resolve(true);
	}

	public getAccount(): Account {
		return this.account;
	}
}
