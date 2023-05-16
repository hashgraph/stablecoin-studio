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
import ProxyConfiguration from '../../domain/context/proxy/ProxyConfiguration.js';
import { CommandBus } from '../../core/command/CommandBus.js';
import { handleValidation } from './Common.js';
import { QueryBus } from '../../core/query/QueryBus.js';
import { LogError } from '../../core/decorator/LogErrorDecorator.js';
import GetProxyConfigRequest from './request/GetProxyConfigRequest.js';
import ChangeProxyAdminRequest from './request/ChangeProxyAdminRequest.js';
import UpgradeImplementationRequest from './request/UpgradeImplementationRequest.js';
import { GetProxyConfigQuery } from '../../app/usecase/query/proxy/GetProxyConfigQuery.js';
import { HederaId } from '../../domain/context/shared/HederaId.js';
import { UpgradeImplementationCommand } from '../../app/usecase/command/proxy/upgrade/UpgradeImplementationCommand.js';
import ContractId from '../../domain/context/contract/ContractId.js';
import { ChangeAdminCommand } from '../../app/usecase/command/proxy/changeAdmin/ChangeAdminCommand.js';

export { ProxyConfiguration };

interface IProxyInPort {
	getProxyConfig(request: GetProxyConfigRequest): Promise<ProxyConfiguration>;
	changeProxyAdmin(request: ChangeProxyAdminRequest): Promise<boolean>;
	upgradeImplementation(
		request: UpgradeImplementationRequest,
	): Promise<boolean>;
}

class ProxyInPort implements IProxyInPort {
	constructor(
		private readonly commandBus: CommandBus = Injectable.resolve(
			CommandBus,
		),
		private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
	) {}

	@LogError
	async getProxyConfig(
		request: GetProxyConfigRequest,
	): Promise<ProxyConfiguration> {
		handleValidation('GetProxyConfigRequest', request);
		const res = await this.queryBus.execute(
			new GetProxyConfigQuery(HederaId.from(request.tokenId)),
		);
		return res.payload;
	}

	@LogError
	async changeProxyAdmin(request: ChangeProxyAdminRequest): Promise<boolean> {
		handleValidation('ChangeProxyAdminRequest', request);
		const res = await this.commandBus.execute(
			new ChangeAdminCommand(
				HederaId.from(request.tokenId),
				HederaId.from(request.targetId),
			),
		);
		return res.payload;
	}

	@LogError
	async upgradeImplementation(
		request: UpgradeImplementationRequest,
	): Promise<boolean> {
		handleValidation('UpgradeImplementationRequest', request);
		const res = await this.commandBus.execute(
			new UpgradeImplementationCommand(
				HederaId.from(request.tokenId),
				new ContractId(request.implementationAddress),
			),
		);
		return res.payload;
	}
}

const Proxy = new ProxyInPort();
export default Proxy;
