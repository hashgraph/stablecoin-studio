import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';

export class ApproveKycCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class ApproveKycCommand extends Command<ApproveKycCommandResponse> {
	constructor(
		public readonly targetId: HederaId,
		public readonly tokenId: HederaId,
	) {
		super();
	}
}
