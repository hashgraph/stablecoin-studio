/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommandHandler as ICommandHandler } from '../../../../src/core/command/CommandHandler.js';
import { CommandHandler } from '../../../../src/core/decorator/CommandHandlerDecorator.js';

export class ConcreteCommand {
	constructor(
		public readonly itemId: string,
		public readonly payload: number,
	) {}
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

	execute(command: ConcreteCommand): Promise<any> {
		this.repo.map.set(command, 'Hello world');
		return Promise.resolve(true);
	}
}
