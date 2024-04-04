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

import { ICommandHandler } from '../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator.js';
import Injectable from '../../../../../core/Injectable.js';
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter.js';
import RPCQueryAdapter from '../../../../../port/out/rpc/RPCQueryAdapter.js';
import NetworkService from '../../../../service/NetworkService.js';
import {
	SetNetworkCommand,
	SetNetworkCommandResponse,
} from './SetNetworkCommand.js';

@CommandHandler(SetNetworkCommand)
export class SetNetworkCommandHandler
	implements ICommandHandler<SetNetworkCommand>
{
	constructor(
		@lazyInject(NetworkService)
		public readonly networkService: NetworkService,
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNodeAdapter: MirrorNodeAdapter,
	) {}

	async execute(
		command: SetNetworkCommand,
	): Promise<SetNetworkCommandResponse> {
		this.networkService.environment = command.environment;
		if (command.consensusNodes)
			this.networkService.consensusNodes = command.consensusNodes;
		if (command.rpcNode) this.networkService.rpcNode = command.rpcNode;

		// Init Mirror Node Adapter
		this.mirrorNodeAdapter.set(command.mirrorNode);
		this.networkService.mirrorNode = command.mirrorNode;

		// Init RPC Query Adapter
		Injectable.resolve(RPCQueryAdapter).init(
			this.networkService.rpcNode.baseUrl,
			this.networkService.rpcNode.apiKey,
		);

		return Promise.resolve(
			new SetNetworkCommandResponse(
				this.networkService.environment,
				this.networkService.mirrorNode ?? '',
				this.networkService.rpcNode ?? '',
				this.networkService.consensusNodes ?? [],
			),
		);
	}
}
