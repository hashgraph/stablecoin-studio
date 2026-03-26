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
import { lazyInject } from '../../core/decorator/LazyInjectDecorator.js';
import { CommandBus } from '../../core/command/CommandBus.js';
import { NetworkConfigurator } from '../../core/service/NetworkConfigurator.js';
import { SetNetworkCommand } from '../usecase/command/network/setNetwork/SetNetworkCommand.js';
import { SetConfigurationCommand } from '../usecase/command/network/setConfiguration/SetConfigurationCommand.js';
import { Environment } from '../../domain/context/network/Environment.js';
import { MirrorNode } from '../../domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../domain/context/network/JsonRpcRelay.js';

@singleton()
export class NetworkConfiguratorImpl extends NetworkConfigurator {
	constructor(
		@lazyInject(CommandBus)
		private readonly commandBus: CommandBus,
	) {
		super();
	}

	async setNetwork(
		environment: Environment,
		mirrorNode: MirrorNode,
		rpcNode: JsonRpcRelay,
	): Promise<void> {
		await this.commandBus.execute(
			new SetNetworkCommand(environment, mirrorNode, rpcNode),
		);
	}

	async setConfiguration(
		factoryAddress: string,
		resolverAddress: string,
	): Promise<void> {
		await this.commandBus.execute(
			new SetConfigurationCommand(factoryAddress, resolverAddress),
		);
	}
}
