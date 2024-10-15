import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';

export class CashInCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class CashInCommand extends Command<CashInCommandResponse> {
	constructor(
		public readonly amount: string,
		public readonly targetId: HederaId,
		public readonly tokenId: HederaId,
		public readonly startDate?: string,
	) {
		super();
	}
}
