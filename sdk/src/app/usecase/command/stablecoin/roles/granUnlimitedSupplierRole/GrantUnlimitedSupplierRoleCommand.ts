import { Command } from "../../../../../../core/command/Command.js";
import { CommandResponse } from "../../../../../../core/command/CommandResponse.js";
import { HederaId } from "../../../../../../domain/context/shared/HederaId.js";

export class GrantUnlimitedSupplierRoleCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class GrantUnlimitedSupplierRoleCommand extends Command<GrantUnlimitedSupplierRoleCommandResponse> {
	constructor(
		public readonly targetId: HederaId,
		public readonly tokenId: HederaId
	) {
		super();
	}
}
