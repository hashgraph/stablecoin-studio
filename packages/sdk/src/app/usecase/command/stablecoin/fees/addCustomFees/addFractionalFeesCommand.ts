import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';

export class addFractionalFeesCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class addFractionalFeesCommand extends Command<addFractionalFeesCommandResponse> {
	constructor(
		public readonly tokenId: HederaId,
		public readonly collectorId: HederaId,
		public readonly amountNumerator: number,
		public readonly amountDenominator: number,
		public readonly min: BigDecimal,
		public readonly max: BigDecimal,
		public readonly net: boolean,
		public readonly collectorsExempt: boolean,
	) {
		super();
	}
}
