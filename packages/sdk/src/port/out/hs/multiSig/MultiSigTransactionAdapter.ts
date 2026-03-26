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
import { BaseHederaTransactionAdapter } from '../BaseHederaTransactionAdapter.js';
import {
	AccountId,
	Client,
	Timestamp,
	Transaction,
	TransactionId,
} from '@hiero-ledger/sdk';
import Account from '../../../../domain/context/account/Account.js';
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse.js';
import { lazyInject } from '../../../../core/decorator/LazyInjectDecorator.js';
import { AbstractNetworkService } from '../../../../core/service/AbstractNetworkService.js';
import { AbstractMirrorNodeAdapter } from '../../mirror/AbstractMirrorNodeAdapter.js';
import { AbstractBackendAdapter } from '../../backend/AbstractBackendAdapter.js';
import { SupportedWallets } from '../../../../domain/context/network/Wallet.js';
import { Environment } from '../../../../domain/context/network/Environment.js';
import Injectable from '../../../../core/Injectable.js';
import { InitializationData } from '../../TransactionAdapter.js';
import LogService from '../../../../core/service/LogService.js';
import {
	WalletEvents,
	WalletPairedEvent,
} from '../../../../domain/context/event/WalletEvent.js';
import { AbstractEventService } from '../../../../core/service/AbstractEventService.js';
import Hex from '../../../../core/Hex.js';
import { TransactionDescriber } from '../../../../core/service/TransactionDescriber.js';
import { TransactionType } from '../../TransactionResponseEnums.js';
import type { SigningConfig } from '../../../../core/config/SigningConfig.js';

@singleton()
export class MultiSigTransactionAdapter extends BaseHederaTransactionAdapter {
	public account: Account;
	protected network: Environment;

	constructor(
		@lazyInject(AbstractEventService) public readonly eventService: AbstractEventService,
		@lazyInject(AbstractNetworkService)
		public readonly networkService: AbstractNetworkService,
		@lazyInject(AbstractMirrorNodeAdapter)
		public readonly mirrorNodeAdapter: AbstractMirrorNodeAdapter,
		@lazyInject(AbstractBackendAdapter)
		public readonly backendAdapter: AbstractBackendAdapter,
		@lazyInject(TransactionDescriber)
		private readonly transactionDescriber: TransactionDescriber,
	) {
		super();
	}

	/**
	 * Main execution point - serializes transaction and sends to backend for multi-sig coordination.
	 * This is called by all operations (both native HTS and contract calls).
	 * Note: transactionType is not used in MultiSig as we serialize the transaction for external signing.
	 */
	public async processTransaction(
		t: Transaction,
		_transactionType: TransactionType,
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

		if (
			!this.networkService.consensusNodes ||
			this.networkService.consensusNodes.length == 0
		) {
			throw new Error(
				'In order to create multisignature transactions you must set consensus nodes for the environment',
			);
		}

		const client = Client.forNetwork(
			Object.fromEntries(
				this.networkService.consensusNodes.map((n) => [n.url, n.nodeId]),
			),
		);

		if (!this.account.multiKey) {
			throw new Error('MultiKey not found in the account');
		}

		this.account.multiKey.keys.forEach((key) => publicKeys.push(key.key));

		const transactionDescription = await this.transactionDescriber.getDescription(
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
			this.networkService.consensusNodes,
		);

		return new TransactionResponse(transactionId);
	}

	// ===== Abstract Method Implementations =====

	public supportsEvmOperations(): boolean {
		// MultiSig can work with both EVM and native operations
		// The backend handles the actual signing
		return true;
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

		const adapter = this.backendAdapter;
		return {
			type: 'multisig',
			client,
			backend: {
				submitTransaction: (txBytes: Uint8Array) =>
					adapter.addTransaction(
						Buffer.from(txBytes).toString('hex'),
						'Multi-sig transaction',
						this.account.id.toString(),
						this.account.multiKey?.keys.map(k => k.key) ?? [],
						this.account.multiKey?.threshold ?? 1,
						env,
						new Date(),
					),
			},
		};
	}

	// ===== Wallet Lifecycle Methods =====

	// ! MultiSig cannot be used to sign anything directly
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
