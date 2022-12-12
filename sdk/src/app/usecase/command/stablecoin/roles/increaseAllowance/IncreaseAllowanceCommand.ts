import { Command } from "../../../../../../core/command/Command.js";
import { CommandResponse } from "../../../../../../core/command/CommandResponse.js";
import BigDecimal from "../../../../../../domain/context/shared/BigDecimal.js";
import { HederaId } from "../../../../../../domain/context/shared/HederaId.js";
import Account from '../../../../../../domain/context/account/Account.js';

export class IncreaseAllowanceCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class IncreaseAllowanceCommand extends Command<IncreaseAllowanceCommandResponse> {
	constructor(
		public readonly amount: BigDecimal,
		public readonly targetId: Account,
		public readonly tokenId: HederaId,
	) {
		super();
	}
}
