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
