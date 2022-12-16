import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';

export class WipeCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class WipeCommand extends Command<WipeCommandResponse> {
	constructor(
		public readonly amount: string,
		public readonly targetId: HederaId,
		public readonly tokenId: HederaId,
	) {
		super();
	}
}
