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
	CustodialWalletService,
	FireblocksConfig,
	SignatureRequest,
} from 'custodialwalletutils/build/cjs/src';
import fs from 'fs';
import path from 'path';
import { singleton } from 'tsyringe';

import { Client, Transaction } from '@hashgraph/sdk';

import EventService from '../../../../../app/service/event/EventService';
import {
	WalletEvents,
	WalletPairedEvent,
} from '../../../../../app/service/event/WalletEvent';
import LogService from '../../../../../app/service/LogService';
import NetworkService from '../../../../../app/service/NetworkService';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator';
import Injectable from '../../../../../core/Injectable';
import { Environment } from '../../../../../domain/context/network/Environment';
import { SupportedWallets } from '../../../../../domain/context/network/Wallet';
import TransactionResponse from '../../../../../domain/context/transaction/TransactionResponse.js';
import { MirrorNodeAdapter } from '../../../mirror/MirrorNodeAdapter';
import { InitializationData } from '../../../TransactionAdapter';
import { TransactionType } from '../../../TransactionResponseEnums';
import { SigningError } from '../../error/SigningError';
import { HederaTransactionAdapter } from '../../HederaTransactionAdapter';
import { HTSTransactionResponseAdapter } from '../../hts/HTSTransactionResponseAdapter';
import { TransactionResponse as HTransactionResponse } from '@hashgraph/sdk/lib/exports';
import Account, {
	AccountProps,
} from '../../../../../domain/context/account/Account';

const fireblocksAccountId = '0.0.5712904';
const fireblocksPublicKey =
	'04eb152576e3af4dccbabda7026b85d8fdc0ad3f18f26540e42ac71a08e21623';

//------------------  Fireblocks  ------------------//
// const apiSecretKey = fs.readFileSync(
// 	path.resolve('/home/mario/Documents/fireblocks-secret.key'),
// 	'utf8',
// );
const apiSecretKey = 'c2VjcmV0';
const apiKey = '652415d5-e004-4dfd-9b3b-d93e8fc939d7';
const baseUrl = 'https://api.fireblocks.io';
const vaultAccountId = '2';
//------------------  end Fireblocks  ------------------//

@singleton()
export class FireblocksTransactionAdapter extends HederaTransactionAdapter {
	private _client: Client;
	private custodialWalletService: CustodialWalletService;
	public network: Environment;
	public account: Account;
	private fireblocksConfig: FireblocksConfig;

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
			wallet: SupportedWallets.FIREBLOCKS,
			initData: {},
		});
		LogService.logTrace('Client Initialized');
		return Promise.resolve(this.networkService.environment);
	}

	public get client(): Client {
		return this._client;
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
			fireblocksAccountId,
			fireblocksPublicKey,
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
		this.fireblocksConfig = new FireblocksConfig(
			apiKey,
			apiSecretKey,
			baseUrl,
			vaultAccountId,
			'HBAR_TEST',
		);
		if (this.fireblocksConfig) {
			this.custodialWalletService = new CustodialWalletService(
				this.fireblocksConfig,
			);
			// } else if (this.dfnsConfig) {
			// 	this.custodialWalletService = new CustodialWalletService(
			// 		this.dfnsConfig,
			// 	);
		} else {
			throw new Error(
				'No custodial wallet service configuration provided',
			);
		}
	}

	getAccount(): Account {
		return this.account;
	}

	async register(): Promise<InitializationData> {
		Injectable.registerTransactionHandler(this);
		const accountMirror = await this.mirrorNodeAdapter.getAccountInfo(
			fireblocksAccountId,
		);
		this.initClient();
		this.initCustodialWalletService();
		const publicKey = accountMirror.publicKey;
		const accountProps: AccountProps = {
			id: fireblocksAccountId,
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
				'[Fireblocks] Signing and sending transaction:',
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
}
