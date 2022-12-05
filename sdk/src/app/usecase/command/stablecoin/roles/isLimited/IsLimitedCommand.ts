import { Command } from "../../../../../../core/command/Command.js";
import { CommandResponse } from "../../../../../../core/command/CommandResponse.js";
import { HederaId } from "../../../../../../domain/context/shared/HederaId.js";
import { Operation } from "../../../../../../domain/context/stablecoin/Capability.js";

export class IsLimitedCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class IsLimitedCommand extends Command<IsLimitedCommandResponse> {
	constructor(
		public readonly role: Operation,
		public readonly targetId: HederaId,
		public readonly tokenId: HederaId,
	) {
		super();
	}
}
