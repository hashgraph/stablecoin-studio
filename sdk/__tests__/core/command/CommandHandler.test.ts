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

/* eslint-disable jest/no-mocks-import */
import { CommandBus } from '../../../src/core/command/CommandBus.js';
import Injectable from '../../../src/core/Injectable.js';
import {
	ConcreteCommand,
	ConcreteCommandResponse,
} from './__mocks__/ConcreteCommandHandler.js';

const commandBus = Injectable.resolve(CommandBus);

describe('🧪 CommandHandler Test', () => {
	it('Executes a simple command', async () => {
		const execSpy = jest.spyOn(commandBus, 'execute');
		const command = new ConcreteCommand('1', 4);
		// console.log('Command: ', command);
		// console.log('Command Bus Handlers: ', commandBus.handlers);
		const res = await commandBus.execute(command);
		// console.log('Response was: ', res);
		expect(res).toBeInstanceOf(ConcreteCommandResponse);
		expect(res.payload).toBe(command.payload);
		expect(execSpy).toHaveBeenCalled();
	});
});
