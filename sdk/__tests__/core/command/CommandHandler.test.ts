import { CommandBus } from '../../../src/core/command/CommandBus.js';
// eslint-disable-next-line jest/no-mocks-import
import {
	ConcreteCommand,
	ConcreteCommandHandler,
	ConcreteCommandResponse,
} from './__mocks__/ConcreteCommandHandler.js';
const commandBus = new CommandBus([ConcreteCommandHandler]);
describe('🧪 CommandHandler Test', () => {
	it('Executes a simple command', async () => {
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
});
