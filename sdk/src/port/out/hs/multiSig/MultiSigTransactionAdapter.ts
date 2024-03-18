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
import { Transaction } from '@hashgraph/sdk';
import Account from '../../../../domain/context/account/Account.js';
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse.js';
import { TransactionType } from '../../TransactionResponseEnums.js';
import { lazyInject } from '../../../../core/decorator/LazyInjectDecorator.js';
import NetworkService from '../../../../app/service/NetworkService.js';
import { QueryBus } from '../../../../core/query/QueryBus.js';
import { MirrorNodeAdapter } from '../../mirror/MirrorNodeAdapter.js';
import { BackendAdapter } from '../../backend/BackendAdapter.js';

@singleton()
export class MultiSigTransactionAdapter extends HederaTransactionAdapter {
	constructor(
		@lazyInject(NetworkService)
		public readonly networkService: NetworkService,
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNodeAdapter: MirrorNodeAdapter,
		@lazyInject(BackendAdapter)
		public readonly backendAdapter: BackendAdapter,
		@lazyInject(QueryBus)
		public readonly queryBus: QueryBus,
	) {
		super(mirrorNodeAdapter, networkService);
	}

	getAccount(): Account {
		throw new Error('Method not implemented.');
	}

	async signAndSendTransaction(
		t: Transaction,
		transactionType: TransactionType,
		nameFunction?: string | undefined,
		abi?: any[] | undefined,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
		//const trasnactionId = await this.backendAdapter.addTransaction();

		//return new TransactionResponse(trasnactionId);
	}

	sign(message: string): Promise<string> {
		throw new Error('Method not implemented.');
	}
}
