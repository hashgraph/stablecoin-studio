import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';

export class RescueHBARCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class RescueHBARCommand extends Command<RescueHBARCommandResponse> {
	constructor(
		public readonly amount: string,
		public readonly tokenId: HederaId,
	) {
		super();
	}
}
