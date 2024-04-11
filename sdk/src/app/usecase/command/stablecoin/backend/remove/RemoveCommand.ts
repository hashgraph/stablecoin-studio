import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';

export class RemoveCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class RemoveCommand extends Command<RemoveCommandResponse> {
	constructor(public readonly transactionId: string) {
		super();
	}
}
