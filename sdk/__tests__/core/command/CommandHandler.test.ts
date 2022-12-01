/* eslint-disable jest/no-mocks-import */
import {
	CashInCommand,
	CashInCommandResponse,
} from '../../../src/app/usecase/command/stablecoin/cashin/CashInCommand.js';
import { CommandBus } from '../../../src/core/command/CommandBus.js';
import { Injectable } from '../../../src/core/Injectable.js';
import BigDecimal from '../../../src/domain/context/shared/BigDecimal.js';
import { HederaId } from '../../../src/domain/context/shared/HederaId.js';
import {
	ConcreteCommand,
	ConcreteCommandResponse,
} from './__mocks__/ConcreteCommandHandler.js';
const EXAMPLE_AID = HederaId.from('0.0.1');

const commandBus = Injectable.resolve(CommandBus);

describe('🧪 CommandHandler Test', () => {
	// beforeAll(() => {

	// })
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

	it('Executes a cash in mock command', async () => {
		const execSpy = jest.spyOn(commandBus, 'execute');
		const cashInCommand = new CashInCommand(
			{ id: EXAMPLE_AID, environment: 'testnet', evmAddress: '0x000' },
			BigDecimal.fromString('1.1234'),
			EXAMPLE_AID,
			EXAMPLE_AID,
			EXAMPLE_AID,
		);
		console.log('Command: ', cashInCommand);
		console.log('Command Bus Handlers: ', commandBus.handlers);
		const res = await commandBus.execute(cashInCommand);
		console.log('Response was: ', res);
		expect(res).toBeInstanceOf(CashInCommandResponse);
		expect(res.payload).toBe(true);
		expect(execSpy).toHaveBeenCalled();
	});
});
