import { Command } from "../../../../../../core/command/Command.js";
import { CommandResponse } from "../../../../../../core/command/CommandResponse.js";
import { HederaId } from "../../../../../../domain/context/shared/HederaId.js";
import { StableCoinRole } from "../../../../../../domain/context/stablecoin/StableCoinRole.js";

export class GrantRoleCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class GrantRoleCommand extends Command<GrantRoleCommandResponse> {
	constructor(
		public readonly role: StableCoinRole,
		public readonly targetId: HederaId,
		public readonly tokenId: HederaId,
	) {
		super();
	}
}
