import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';

export class RescueCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class RescueCommand extends Command<RescueCommandResponse> {
	constructor(
		public readonly amount: BigDecimal,
		public readonly targetId: HederaId,
		public readonly tokenId: HederaId,
	) {
		super();
	}
}
