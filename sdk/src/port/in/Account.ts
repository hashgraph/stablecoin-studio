/*
 *
 * Hedera Stable Coin SDK
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

/* eslint-disable @typescript-eslint/no-unused-vars */
import Injectable from '../../core/Injectable.js';
import { QueryBus } from '../../core/query/QueryBus.js';
import {
	GetAccountInfoRequest,
	GetListStableCoinRequest,
} from './request/index.js';
import { GetListStableCoinQuery } from '../../app/usecase/query/stablecoin/list/GetListStableCoinQuery.js';
import GetPublicKeyRequest from './request/GetPublicKeyRequest.js';
import PublicKey from '../../domain/context/account/PublicKey.js';
import { default as HederaAccount } from '../../domain/context/account/Account.js';
import StableCoinListViewModel from '../out/mirror/response/StableCoinListViewModel.js';
import AccountViewModel from '../out/mirror/response/AccountViewModel.js';
import { HederaId } from '../../domain/context/shared/HederaId.js';
import { GetAccountInfoQuery } from '../../app/usecase/query/account/info/GetAccountInfoQuery.js';
import { InvalidResponse } from '../out/mirror/error/InvalidResponse.js';
import { handleValidation } from './Common.js';
import { LogError } from '../../core/decorator/LogErrorDecorator.js';

export { AccountViewModel, StableCoinListViewModel };

interface IAccountInPort {
	getPublicKey(request: GetPublicKeyRequest): Promise<PublicKey>;
	listStableCoins(
		request: GetListStableCoinRequest,
	): Promise<StableCoinListViewModel>;
	getInfo(request: GetAccountInfoRequest): Promise<AccountViewModel>;
}

class AccountInPort implements IAccountInPort {
	public readonly NullHederaAccount: HederaAccount = HederaAccount.NULL;
	public readonly NullPublicKey: PublicKey = PublicKey.NULL;

	constructor(
		private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
	) {}

	@LogError
	async getPublicKey(request: GetPublicKeyRequest): Promise<PublicKey> {
		handleValidation('GetPublicKeyRequest', request);
		const res = await this.queryBus.execute(
			new GetAccountInfoQuery(HederaId.from(request.account.accountId)),
		);
		if (!res.account.publicKey)
			throw new InvalidResponse(
				`No public key for account ${
					res.account.id ??
					res.account.alias ??
					res.account.accountEvmAddress
				}`,
			);
		return res.account.publicKey;
	}

	@LogError
	async listStableCoins(
		request: GetListStableCoinRequest,
	): Promise<StableCoinListViewModel> {
		handleValidation('GetListStableCoinRequest', request);
		return (
			await this.queryBus.execute(
				new GetListStableCoinQuery(
					HederaId.from(request.account.accountId),
				),
			)
		).list;
	}

	@LogError
	async getInfo(request: GetAccountInfoRequest): Promise<AccountViewModel> {
		handleValidation('GetAccountInfoRequest', request);
		return (
			await this.queryBus.execute(
				new GetAccountInfoQuery(
					HederaId.from(request.account.accountId),
				),
			)
		).account;
	}
}

const Account = new AccountInPort();
export default Account;
