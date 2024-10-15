import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';

export class SubmitCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class SubmitCommand extends Command<SubmitCommandResponse> {
	constructor(public readonly transactionId: string) {
		super();
	}
}
