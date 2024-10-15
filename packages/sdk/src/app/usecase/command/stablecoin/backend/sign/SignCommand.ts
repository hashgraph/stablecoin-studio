import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';

export class SignCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class SignCommand extends Command<SignCommandResponse> {
	constructor(public readonly transactionId: string) {
		super();
	}
}
