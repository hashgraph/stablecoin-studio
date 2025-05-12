import { Command } from '../../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../../core/command/CommandResponse.js';
import { HederaId } from '../../../../../../../domain/context/shared/HederaId.js';

export class ReclaimHoldCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class ReclaimHoldCommand extends Command<ReclaimHoldCommandResponse> {
	constructor(
		public readonly tokenId: HederaId,
		public readonly holdId: number,
		public readonly sourceId: HederaId,
	) {
		super();
	}
}
