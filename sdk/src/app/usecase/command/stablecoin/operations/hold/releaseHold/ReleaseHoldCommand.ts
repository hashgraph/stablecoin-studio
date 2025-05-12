import { Command } from '../../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../../core/command/CommandResponse.js';
import { HederaId } from '../../../../../../../domain/context/shared/HederaId.js';

export class ReleaseHoldCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class ReleaseHoldCommand extends Command<ReleaseHoldCommandResponse> {
	constructor(
		public readonly tokenId: HederaId,
		public readonly holdId: number,
		public readonly sourceId: HederaId,
		public readonly amount: string,
	) {
		super();
	}
}
