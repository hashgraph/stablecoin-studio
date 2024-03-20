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
import { AccountId, Client, Transaction } from '@hashgraph/sdk';
import Account from '../../../../domain/context/account/Account.js';
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse.js';
import { TransactionType } from '../../TransactionResponseEnums.js';
import { lazyInject } from '../../../../core/decorator/LazyInjectDecorator.js';
import NetworkService from '../../../../app/service/NetworkService.js';
import { MirrorNodeAdapter } from '../../mirror/MirrorNodeAdapter.js';
import { BackendAdapter } from '../../backend/BackendAdapter.js';
import { SupportedWallets } from '../../../../domain/context/network/Wallet';
import {
	Environment,
	testnet,
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
import TransactionDescription from './TransactionDescription.js';
import Hex from '../../../../core/Hex.js';

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
		nameFunction?: string | undefined,
		abi?: any[] | undefined,
	): Promise<TransactionResponse<any, Error>> {
		const publicKeys: string[] = [];

		const accountId: AccountId = AccountId.fromString(
			this.account.id.toString(),
		);
		t.setTransactionValidDuration(180);
		t._freezeWithAccountId(accountId);

		let client: Client = Client.forTestnet();
		client.setNetwork({ '34.94.106.61:50211': '0.0.3' });

		if (this.networkService.environment == previewnet)
			client = Client.forPreviewnet();
		else if (this.networkService.environment == mainnet)
			client = Client.forMainnet();

		this.account.multiKey!.keys.forEach((key) => publicKeys.push(key.key));

		const trasnactionId = await this.backendAdapter.addTransaction(
			Hex.fromUint8Array(t.freezeWith(client).toBytes()),
			TransactionDescription.getDescription(t),
			this.account.id.toString(),
			publicKeys,
			this.account.multiKey!.threshold,
			this.networkService.environment,
		);

		return new TransactionResponse(trasnactionId);
	}

	// MultiSig cannot eb used to sign anything
	sign(message: string): Promise<string> {
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
