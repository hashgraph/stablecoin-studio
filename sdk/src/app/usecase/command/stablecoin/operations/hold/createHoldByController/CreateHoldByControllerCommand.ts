import { Command } from '../../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../../core/command/CommandResponse.js';
import { HederaId } from '../../../../../../../domain/context/shared/HederaId.js';

export class CreateHoldByControllerCommandResponse implements CommandResponse {
	constructor(
		public readonly holdId: number,
		public readonly payload: boolean,
	) {}
}

export class CreateHoldByControllerCommand extends Command<CreateHoldByControllerCommandResponse> {
	constructor(
		public readonly tokenId: HederaId,
		public readonly sourceId: HederaId,
		public readonly amount: string,
		public readonly escrow: HederaId,
		public readonly expirationDate: string,
		public readonly targetId?: HederaId,
	) {
		super();
	}
}
