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

import { Client, Transaction } from '@hashgraph/sdk';
import TransactionResponse from 'domain/context/transaction/TransactionResponse';
import { TransactionType } from 'port/out/TransactionResponseEnums';
import { HederaTransactionAdapter } from '../../HederaTransactionAdapter';
import {
	CustodialWalletService,
	DFNSConfig,
	SignatureRequest,
} from 'custodialwalletutils/build/cjs/src';
import { Environment } from '../../../../../domain/context/network/Environment';
import { singleton } from 'tsyringe';
import LogService from '../../../../../app/service/LogService';
import { TransactionResponse as HTransactionResponse } from '@hashgraph/sdk/lib/exports';
import { SigningError } from '../../error/SigningError';
import { InitializationData } from '../../../TransactionAdapter';
import Injectable from '../../../../../core/Injectable';
import {
	WalletEvents,
	WalletPairedEvent,
} from '../../../../../app/service/event/WalletEvent';
import { SupportedWallets } from '../../../../../domain/context/network/Wallet';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator';
import EventService from '../../../../../app/service/event/EventService';
import { MirrorNodeAdapter } from '../../../mirror/MirrorNodeAdapter';
import NetworkService from '../../../../../app/service/NetworkService';
import Account, {
	AccountProps,
} from '../../../../../domain/context/account/Account';
import { HTSTransactionResponseAdapter } from '../HTSTransactionResponseAdapter';

@singleton()
export class DFNSTransactionAdapter extends HederaTransactionAdapter {
	private _client: Client;
	private custodialWalletService: CustodialWalletService;
	public network: Environment;
	public account: Account;
	private dfnsConfig: DFNSConfig;

	constructor(
		@lazyInject(EventService) public readonly eventService: EventService,
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNodeAdapter: MirrorNodeAdapter,
		@lazyInject(NetworkService)
		public readonly networkService: NetworkService, //private fireblocksConfig?: FireblocksConfig, //private dfnsConfig?: DFNSConfig,
	) {
		super(mirrorNodeAdapter, networkService);
	}

	init(): Promise<string> {
		this.eventService.emit(WalletEvents.walletInit, {
			wallet: SupportedWallets.DFNS,
			initData: {},
		});
		LogService.logTrace('Client Initialized');
		return Promise.resolve(this.networkService.environment);
	}

	async register(): Promise<InitializationData> {
		Injectable.registerTransactionHandler(this);
		const accountMirror = await this.mirrorNodeAdapter.getAccountInfo(
			dfnsAccountId,
		);
		this.initClient();
		this.initCustodialWalletService();
		const publicKey = accountMirror.publicKey;
		const accountProps: AccountProps = {
			id: dfnsAccountId,
			publicKey: publicKey,
		};
		this.account = new Account(accountProps);
		const eventData: WalletPairedEvent = {
			wallet: SupportedWallets.FIREBLOCKS,
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

	async signAndSendTransaction(
		t: Transaction,
		transactionType: TransactionType,
		nameFunction?: string,
		abi?: any[],
	): Promise<TransactionResponse> {
		try {
			LogService.logTrace(
				'[DFNS] Signing and sending transaction:',
				nameFunction,
			);

			const tr: HTransactionResponse = await t.execute(this._client);

			this.logTransaction(
				tr.transactionId.toString(),
				this.networkService.environment,
			);

			return HTSTransactionResponseAdapter.manageResponse(
				this.networkService.environment,
				tr,
				transactionType,
				this._client,
				nameFunction,
				abi,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(error);
		}
	}

	private initClient(): void {
		const currentNetwork = this.networkService.environment;
		switch (currentNetwork) {
			case 'testnet':
				this._client = Client.forTestnet();
				break;
			case 'mainnet':
				this._client = Client.forMainnet();
				break;
			default:
				throw new Error('Network not supported');
		}
		this._client.setOperatorWith(
			dfnsAccountId,
			dfnsPublicKey,
			this.signingService,
		);
	}

	private signingService = async (
		message: Uint8Array,
	): Promise<Uint8Array> => {
		const signatureRequest = new SignatureRequest(message);
		return await this.custodialWalletService.signTransaction(
			signatureRequest,
		);
	};

	private initCustodialWalletService(): void {
		//DELETE
		this.dfnsConfig = new DFNSConfig(
			serviceAccountSecretKey,
			dfnsEcdsaServiceaccountCredentialId,
			dfnsEcdsaServiceAccountAuthToken,
			dfnsAppOrigin,
			dfnsAppId,
			dfnsTestUrl,
			dfnsWalletId,
		);
		if (this.dfnsConfig) {
			this.custodialWalletService = new CustodialWalletService(
				this.dfnsConfig,
			);
		} else {
			throw new Error(
				'No custodial wallet service configuration provided',
			);
		}
	}

	getAccount(): Account {
		return this.account;
	}
}
