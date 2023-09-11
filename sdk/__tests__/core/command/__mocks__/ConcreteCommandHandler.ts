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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Command } from '../../../../src/core/command/Command.js';
import { ICommandHandler } from '../../../../src/core/command/CommandHandler.js';
import { CommandResponse } from '../../../../src/core/command/CommandResponse.js';
import { CommandHandler } from '../../../../src/core/decorator/CommandHandlerDecorator.js';

export class ConcreteCommandResponse implements CommandResponse {
	constructor(public readonly payload: number) {}
}

export class ConcreteCommand extends Command<ConcreteCommandResponse> {
	constructor(
		public readonly itemId: string,
		public readonly payload: number,
	) {
		super();
	}
}

export class ConcreteCommandRepository {
	public map = new Map<ConcreteCommand, any>();
}

@CommandHandler(ConcreteCommand)
export class ConcreteCommandHandler
	implements ICommandHandler<ConcreteCommand>
{
	constructor(
		public readonly repo: ConcreteCommandRepository = new ConcreteCommandRepository(),
	) {}

	execute(command: ConcreteCommand): Promise<ConcreteCommandResponse> {
		this.repo.map.set(command, 'Hello world');
		return Promise.resolve(new ConcreteCommandResponse(command.payload));
	}
}
