import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';

export class UnPauseCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class UnPauseCommand extends Command<UnPauseCommandResponse> {
	constructor(public readonly tokenId: HederaId) {
		super();
	}
}
