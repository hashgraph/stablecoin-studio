import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';

export class RescueCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class RescueCommand extends Command<RescueCommandResponse> {
	constructor(
		public readonly amount: string,
		public readonly tokenId: HederaId,
		public readonly startDate?: string,
	) {
		super();
	}
}
