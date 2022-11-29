import { Command } from "../../../../core/command/Command.js";
import { CommandResponse } from "../../../../core/command/CommandResponse.js";
import Account from "../../../../domain/context/account/Account.js";

export class CashInCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class CashInCommand extends Command<CashInCommandResponse> {
	constructor(
		public readonly account: Account,
		public readonly amount: string,
		public readonly proxyContractId: string,
		public readonly targetId: string,
		public readonly tokenId: string,
	) {
		super();
	}
}
