import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';

export class TransfersCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class TransfersCommand extends Command<TransfersCommandResponse> {
	constructor(
		public readonly amounts: string[],
		public readonly targetIds: HederaId[],
		public readonly tokenId: HederaId,
	) {
		super();
	}
}
