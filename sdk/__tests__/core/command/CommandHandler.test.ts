/* eslint-disable jest/no-mocks-import */

import { CommandBus } from '../../../src/core/command/CommandBus.js';
import { Injectable } from '../../../src/core/Injectable.js';

import {
	ConcreteCommand,
	ConcreteCommandResponse,
} from './__mocks__/ConcreteCommandHandler.js';

const commandBus = Injectable.resolve(CommandBus);

describe('🧪 CommandHandler Test', () => {
	it('Executes a simple command', async () => {
		const execSpy = jest.spyOn(commandBus, 'execute');
		const command = new ConcreteCommand('1', 4);
		console.log('Command: ', command);
		console.log('Command Bus Handlers: ', commandBus.handlers);
		const res = await commandBus.execute(command);
		console.log('Response was: ', res);
		expect(res).toBeInstanceOf(ConcreteCommandResponse);
		expect(res.payload).toBe(command.payload);
		expect(execSpy).toHaveBeenCalled();
	});
});
