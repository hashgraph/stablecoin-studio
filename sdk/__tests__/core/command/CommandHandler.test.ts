/* eslint-disable jest/no-mocks-import */
import { CommandBus } from '../../../src/core/command/CommandBus.js';
import {
	CashInCommand,
	CashInCommandHandler,
	CashInCommandResponse,
} from './__mocks__/CashInCommandHandler.js';
import {
	ConcreteCommand,
	ConcreteCommandHandler,
	ConcreteCommandResponse,
} from './__mocks__/ConcreteCommandHandler.js';
const EXAMPLE_AID = '0.0.1';
describe('🧪 CommandHandler Test', () => {
	it('Executes a simple command', async () => {
		const commandBus = new CommandBus([ConcreteCommandHandler]);
		const execSpy = jest.spyOn(commandBus, 'execute');
		const command = new ConcreteCommand('1', 4);
		console.log('Command: ', command);
		expect(commandBus.handlers.size).toBe(1);
		console.log('Command Bus Handlers: ', commandBus.handlers);
		const res = await commandBus.execute(command);
		console.log('Response was: ', res);
		expect(res).toBeInstanceOf(ConcreteCommandResponse);
		expect(res.payload).toBe(command.payload);
		expect(execSpy).toHaveBeenCalled();
	});

	it('Executes a cash in mock command', async () => {
		const commandBus = new CommandBus([
			ConcreteCommandHandler,
			CashInCommandHandler,
		]);
		const execSpy = jest.spyOn(commandBus, 'execute');
		const cashInCommand = new CashInCommand(
			{ id: EXAMPLE_AID },
			'1.1234',
			EXAMPLE_AID,
			EXAMPLE_AID,
			EXAMPLE_AID,
		);
		console.log('Command: ', cashInCommand);
		expect(commandBus.handlers.size).toBe(2);
		console.log('Command Bus Handlers: ', commandBus.handlers);
		const res = await commandBus.execute(cashInCommand);
		console.log('Response was: ', res);
		expect(res).toBeInstanceOf(CashInCommandResponse);
		expect(res.payload).toBe(true);
		expect(execSpy).toHaveBeenCalled();
	});
});
