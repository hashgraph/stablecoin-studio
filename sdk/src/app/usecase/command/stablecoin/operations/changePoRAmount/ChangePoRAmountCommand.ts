import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';

export class ChangePoRAmountCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class ChangePoRAmountCommand extends Command<ChangePoRAmountCommandResponse> {
	constructor(
		public readonly tokenId: HederaId,
        public readonly PoRAmount: BigDecimal
	) {
		super();
	}
}
