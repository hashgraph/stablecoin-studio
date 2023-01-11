import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';

export class GetPoRAmountCommandResponse implements CommandResponse {
	constructor(public readonly payload: BigDecimal) {}
}

export class GetPoRAmountCommand extends Command<GetPoRAmountCommandResponse> {
	constructor(
		public readonly tokenId: HederaId
	) {
		super();
	}
}
