import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';

export class addFixedFeesCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class addFixedFeesCommand extends Command<addFixedFeesCommandResponse> {
	constructor(
		public readonly tokenId: HederaId,
		public readonly collectorId: HederaId,
		public readonly tokenIdCollected: HederaId,
		public readonly amount: BigDecimal,
	) {
		super();
	}
}
