import { CommandHandler } from '../../../../src/core/command/CommandHandler.js';

export class ConcreteCommand {
	constructor(
		public readonly itemId: string,
		public readonly payload: number,
	) {}
}

export class ConcreteCommandRepository {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public map = new Map<ConcreteCommand, any>();
}

export class ConcreteCommandHandler implements CommandHandler<ConcreteCommand> {
	constructor(
		public readonly repo: ConcreteCommandRepository = new ConcreteCommandRepository(),
	) {}

	execute(command: ConcreteCommand): Promise<any> {
        this.repo.map.set(command, 'Hello world')
		return Promise.resolve(true); 
	}
}