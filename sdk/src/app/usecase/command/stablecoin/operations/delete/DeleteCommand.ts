import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';

export class DeleteCommandResponse implements CommandResponse {
	constructor(
		public readonly payload: boolean,
		public readonly startDate?: string,
	) {}
}

export class DeleteCommand extends Command<DeleteCommandResponse> {
	constructor(
		public readonly tokenId: HederaId,
		public readonly startDate?: string,
	) {
		super();
	}
}
