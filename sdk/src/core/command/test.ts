/* eslint-disable @typescript-eslint/no-empty-interface */

interface CommandResponse {}
interface ICommand {}

export class Command<T> implements ICommand {
	private $resultType!: T;
}

export interface ICommandBus {
	execute<X>(command: Command<X>): Promise<X>;
}

export type IInferringCommandHandler<CommandType extends Command<unknown>> =
	CommandType extends Command<infer ResultType>
		? {
				execute(command: CommandType): Promise<ResultType>;
		  }
		: never;

class ConcreteCommandResponse implements CommandResponse {
	constructor(public readonly status: string) {}
}

class ConcreteCommand extends Command<ConcreteCommandResponse> {
	constructor(public readonly value: string) {
		super();
	}
}

class CommandHandler<CommandType extends Command<unknown>>
	implements IInferringCommandHandler<ConcreteCommand>
{
	execute(command: ConcreteCommand): Promise<ConcreteCommandResponse> {
		throw new Error('Method not implemented.');
	}
}

class CommandBus implements ICommandBus {
	execute<X>(command: Command<X>): Promise<X> {
		throw new Error('Method not implemented.');
	}
}

// Test

const bus = new CommandBus();
const res = bus.execute(new ConcreteCommand('1'));
