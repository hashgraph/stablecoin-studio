import { Command } from "../../../../../../core/command/Command.js";
import { CommandResponse } from "../../../../../../core/command/CommandResponse.js";
import BigDecimal from "../../../../../../domain/context/shared/BigDecimal.js";
import { HederaId } from "../../../../../../domain/context/shared/HederaId.js";
import Account from '../../../../../../domain/context/account/Account.js';

export class BalanceOfCommandResponse implements CommandResponse {
	constructor(public readonly payload: BigDecimal) {}
}

export class BalanceOfCommand extends Command<BalanceOfCommandResponse> {
	constructor(
		public readonly targetId: Account,
		public readonly tokenId: HederaId,
	) {
		super();
	}
}
