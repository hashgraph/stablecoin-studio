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

import {HederaTransactionAdapter} from '../HederaTransactionAdapter';
import {singleton} from 'tsyringe';
import Account from 'domain/context/account/Account';
import {AccountId, Client, Transaction} from '@hashgraph/sdk';
import {TransactionType} from '../../TransactionResponseEnums';
import {
	CustodialWalletService,
	DFNSConfig,
	FireblocksConfig,
	SignatureRequest,
} from 'custodialwalletutils/build/esm/src';
import LogService from '../../../../app/service/LogService';
import {SigningError} from '../error/SigningError';
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse.js';
import fs from 'fs';
import path from 'path';
import {GetAccountInfoQuery} from '../../../../app/usecase/query/account/info/GetAccountInfoQuery';
import {HederaId} from '../../../../domain/context/shared/HederaId';
import {AccountIdNotValid} from '../../../../domain/context/account/error/AccountIdNotValid';
import {lazyInject} from '../../../../core/decorator/LazyInjectDecorator';
import EventService from '../../../../app/service/event/EventService';
import NetworkService from '../../../../app/service/NetworkService';
import {MirrorNodeAdapter} from '../../mirror/MirrorNodeAdapter';
import {QueryBus} from '../../../../core/query/QueryBus';
import {HTSTransactionResponseAdapter} from '../hts/HTSTransactionResponseAdapter';

const apiSecretKey = fs.readFileSync(
	path.resolve('/home/mamorales/fireblocks_dario/fireblocks_secret.key'),
	'utf8',
);
const apiKey = '652415d5-e004-4dfd-9b3b-d93e8fc939d7';
const baseUrl = 'https://api.fireblocks.io';
const vaultAccountId = '2';

const nodeId = [];
nodeId.push(new AccountId(3));

const fireblocksAccountId = '0.0.5712904';
const fireblocksPublicKey =
	'04eb152576e3af4dccbabda7026b85d8fdc0ad3f18f26540e42ac71a08e21623';

@singleton()
export class CustodialWalletUtilsTransactionAdapter extends HederaTransactionAdapter {
	private client: Client;
	private custodialWalletService: CustodialWalletService;

	constructor(
		@lazyInject(EventService)
		public readonly eventService: EventService,
		@lazyInject(NetworkService)
		public readonly networkService: NetworkService,
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNodeAdapter: MirrorNodeAdapter,
		@lazyInject(QueryBus)
		private readonly queryBus: QueryBus,
		private fireblocksConfig?: FireblocksConfig,
		private dfnsConfig?: DFNSConfig,
	) {
		super(mirrorNodeAdapter, networkService);
		this.initClient();
		this.initCustodialWalletService();
	}

	initClient(network?: string): void {
		const currentNetwork = network ?? this.networkService.environment;
		switch (currentNetwork) {
			case 'testnet':
				this.client = Client.forTestnet();
				break;
			case 'mainnet':
				this.client = Client.forMainnet();
				break;
			default:
				throw new Error('Network not supported');
		}
		this.client.setOperator(fireblocksAccountId, fireblocksPublicKey);
	}

	initCustodialWalletService(): void {
		if (this.fireblocksConfig) {
			this.custodialWalletService = new CustodialWalletService(
				this.fireblocksConfig,
			);
		} else if (this.dfnsConfig) {
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
		throw new Error('Method not implemented.');
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

	async signAndSendTransaction(
		t: Transaction,
		transactionType: TransactionType,
		nameFunction?: string,
		abi?: any[],
	): Promise<TransactionResponse> {
		try {
			LogService.logTrace(
				'CSU is signing and sending transaction:',
				nameFunction,
			);

			const signatureRequest = new SignatureRequest(t.toBytes());
			const signedTransactionBytes =
				await this.custodialWalletService.signTransaction(
					signatureRequest,
				);
			const signedTransaction = Transaction.fromBytes(
				signedTransactionBytes,
			);
			const response = await signedTransaction.execute(this.client);

			return HTSTransactionResponseAdapter.manageResponse(
				this.networkService.environment,
				response,
				transactionType,
				this.client,
				nameFunction,
				abi,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(error);
		}
	}
}
