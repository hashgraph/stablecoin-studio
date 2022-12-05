import { Command } from "../../../../../core/command/Command.js";
import { CommandResponse } from "../../../../../core/command/CommandResponse.js";
import BigDecimal from "../../../../../domain/context/shared/BigDecimal.js";
import { HederaId } from "../../../../../domain/context/shared/HederaId.js";

export class FreezeCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class FreezeCommand extends Command<FreezeCommandResponse> {
	constructor(
		public readonly amount: BigDecimal,
		public readonly targetId: HederaId,
		public readonly tokenId: HederaId,
	) {
		super();
	}
}
