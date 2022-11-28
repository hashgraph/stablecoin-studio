import { CommandBus } from '../../../src/core/command/CommandBus.js';
// eslint-disable-next-line jest/no-mocks-import
import {
	ConcreteCommand,
	ConcreteCommandHandler,
} from './__mocks__/ConcreteCommandHandler.js';

describe('🧪 CommandHandler Test', () => {
	afterEach(() => {
		jest.resetAllMocks();
	});

	const commandBus = new CommandBus([ConcreteCommandHandler]);

	it('Executes a simple command', async () => {
		const execSpy = jest.spyOn(commandBus, 'execute');
		const command = new ConcreteCommand('1', 4);
		console.log('Command: ', command);
		expect(commandBus.handlers).toHaveLength(1);
		console.log('Command Bus Handlers: ', commandBus.handlers);
		const res = await commandBus.execute(command);
		console.log('Response was: ', JSON.stringify(res));
		expect(res).toBe(true);
		expect(execSpy).toHaveBeenCalled();
	});
});
