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
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter.js';
import NetworkService from '../../../../service/NetworkService.js';
import {
	SetConfigurationCommand,
	SetConfigurationCommandResponse,
} from './SetConfigurationCommand.js';

@CommandHandler(SetConfigurationCommand)
export class SetConfigurationCommandHandler
	implements ICommandHandler<SetConfigurationCommand>
{
	constructor(
		@lazyInject(NetworkService)
		public readonly networkService: NetworkService,
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNodeAdapter: MirrorNodeAdapter,
	) {}

	async execute(
		command: SetConfigurationCommand,
	): Promise<SetConfigurationCommandResponse> {
		this.networkService.configuration = {
			factoryAddress: command.factoryAddress,
		};
		return Promise.resolve(
			new SetConfigurationCommandResponse(
				this.networkService.configuration.factoryAddress,
			),
		);
	}
}
