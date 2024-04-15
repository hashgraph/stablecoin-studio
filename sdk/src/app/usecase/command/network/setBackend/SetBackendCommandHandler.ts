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
import { BackendAdapter } from '../../../../../port/out/backend/BackendAdapter.js';
import NetworkService from '../../../../service/NetworkService.js';
import {
	SetBackendCommand,
	SetBackendCommandResponse,
} from '../setBackend/SetBackendCommand.js';

@CommandHandler(SetBackendCommand)
export class SetBackendCommandHandler
	implements ICommandHandler<SetBackendCommand>
{
	constructor(
		@lazyInject(NetworkService)
		public readonly networkService: NetworkService,
		@lazyInject(BackendAdapter)
		public readonly backendAdapter: BackendAdapter,
	) {}

	async execute(
		command: SetBackendCommand,
	): Promise<SetBackendCommandResponse> {
		this.backendAdapter.set(command.backendEndpoint);
		this.networkService.backend = command.backendEndpoint;

		return Promise.resolve(
			new SetBackendCommandResponse(this.networkService.backend ?? ''),
		);
	}
}
