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

import Injectable from '../../core/Injectable.js';
import ContractId from '../../domain/context/contract/ContractId.js';
import { CommandBus } from '../../core/command/CommandBus.js';
import { handleValidation } from './Common.js';
import { QueryBus } from '../../core/query/QueryBus.js';
import { LogError } from '../../core/decorator/LogErrorDecorator.js';
import GetTokenManagerListRequest from './request/GetTokenManagerListRequest.js';
import { GetTokenManagerListQuery } from '../../app/usecase/query/factory/getTokenManagerList/GetTokenManagerListQuery.js';

interface IFactoryInPort {
	getHederaTokenManagerList(
		request: GetTokenManagerListRequest,
	): Promise<ContractId[]>;
}

class FactoryInPort implements IFactoryInPort {
	constructor(
		private readonly commandBus: CommandBus = Injectable.resolve(
			CommandBus,
		),
		private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
	) {}

	@LogError
	async getHederaTokenManagerList(
		request: GetTokenManagerListRequest,
	): Promise<ContractId[]> {
		handleValidation('GetTokenManagerListRequest', request);
		const res = await this.queryBus.execute(
			new GetTokenManagerListQuery(new ContractId(request.factoryId)),
		);
		return res.payload;
	}
}

const Factory = new FactoryInPort();
export default Factory;
