import { Command } from '../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../core/command/CommandResponse.js';

export class DisconnectCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class DisconnectCommand extends Command<DisconnectCommandResponse> {
	constructor() {
		super();
	}
}
