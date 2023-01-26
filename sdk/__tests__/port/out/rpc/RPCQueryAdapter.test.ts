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

import { BalanceOfQuery } from '../../../../src/app/usecase/query/stablecoin/balanceof/BalanceOfQuery.js';
import { GetReserveAddressQuery } from '../../../../src/app/usecase/query/stablecoin/getReserveAddress/GetReserveAddressQuey.js';
import { GetReserveAmountQuery } from '../../../../src/app/usecase/query/stablecoin/getReserveAmount/GetReserveAmountQuery.js';
import { GetRolesQuery } from '../../../../src/app/usecase/query/stablecoin/roles/getRoles/GetRolesQuery.js';
import { HasRoleQuery } from '../../../../src/app/usecase/query/stablecoin/roles/hasRole/HasRoleQuery.js';
import { GetAllowanceQuery } from '../../../../src/app/usecase/query/stablecoin/roles/getAllowance/GetAllowanceQuery.js';
import Injectable from '../../../../src/core/Injectable.js';
import { QueryBus } from '../../../../src/core/query/QueryBus.js';
import { HederaId } from '../../../../src/domain/context/shared/HederaId.js';
import { Network, SetNetworkRequest } from '../../../../src/index.js';
import RPCQueryAdapter from '../../../../src/port/out/rpc/RPCQueryAdapter.js';
import { StableCoinRole } from '../../../../src/domain/context/stablecoin/StableCoinRole.js';

describe('🧪 RPCQueryAdapter', () => {
	const bus = Injectable.resolve(QueryBus);
	const adapter = Injectable.resolve(RPCQueryAdapter);
	const tokenId = '0.0.49332748';
	const adminAccountId = '0.0.49142551';

	beforeAll(async () => {
		await Network.setNetwork(
			new SetNetworkRequest({
				environment: 'testnet',
			}),
		);
	});

	beforeEach(async () => {
		await adapter.init();
	});

	it('Test it initializes', async () => {
		const env = await adapter.init('testUrl');

		expect(env).toEqual('testnet');
		expect(adapter.provider).toBeDefined();
		expect(adapter.provider.connection.url).toEqual('testUrl');
	});

	it('Test it fetches a balance', async () => {
		const res = await bus.execute(
			new BalanceOfQuery(
				HederaId.from(tokenId),
				HederaId.from(adminAccountId),
			),
		);
		expect(res).not.toBeUndefined();
	});

	it('Test it gets roles', async () => {
		const res = await bus.execute(
			new GetRolesQuery(
				HederaId.from(adminAccountId),
				HederaId.from(tokenId),
			),
		);
		expect(res).not.toBeUndefined();
	});

	it('Test it has role', async () => {
		const res = await bus.execute(
			new HasRoleQuery(
				StableCoinRole.DEFAULT_ADMIN_ROLE,
				HederaId.from(adminAccountId),
				HederaId.from(tokenId),
			),
		);
		expect(res).not.toBeUndefined();
	});

	it('Test it gets allowance', async () => {
		const res = await bus.execute(
			new GetAllowanceQuery(
				HederaId.from(adminAccountId),
				HederaId.from(tokenId),
			),
		);
		expect(res).not.toBeUndefined();
	});

	it('Test it fetches reserve address', async () => {
		const res = await bus.execute(
			new GetReserveAddressQuery(HederaId.from(tokenId)),
		);
		expect(res).not.toBeUndefined();
	});

	it('Test it fetches reserve amount', async () => {
		const res = await bus.execute(
			new GetReserveAmountQuery(HederaId.from(tokenId)),
		);
		expect(res).not.toBeUndefined();
	});
});
