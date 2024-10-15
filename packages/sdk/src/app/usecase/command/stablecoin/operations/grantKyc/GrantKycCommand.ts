import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';

export class GrantKycCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class GrantKycCommand extends Command<GrantKycCommandResponse> {
	constructor(
		public readonly targetId: HederaId,
		public readonly tokenId: HederaId,
	) {
		super();
	}
}
