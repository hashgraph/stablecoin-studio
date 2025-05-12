import { Command } from '../../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../../core/command/CommandResponse.js';
import { HederaId } from '../../../../../../../domain/context/shared/HederaId.js';

export class CreateHoldCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class CreateHoldCommand extends Command<CreateHoldCommandResponse> {
	constructor(
		public readonly tokenId: HederaId,
		public readonly amount: string,
		public readonly escrow: HederaId,
		public readonly expirationDate: string,
		public readonly targetId?: HederaId,
	) {
		super();
	}
}
