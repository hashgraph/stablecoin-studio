import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';

export class UnFreezeCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class UnFreezeCommand extends Command<UnFreezeCommandResponse> {
	constructor(
		public readonly targetId: HederaId,
		public readonly tokenId: HederaId,
		public readonly startDate?: string,
	) {
		super();
	}
}
