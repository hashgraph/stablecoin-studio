import { Command } from "../../../../../../core/command/Command.js";
import { CommandResponse } from "../../../../../../core/command/CommandResponse.js";
import BigDecimal from "../../../../../../domain/context/shared/BigDecimal.js";
import { HederaId } from "../../../../../../domain/context/shared/HederaId.js";

export class GrantSupplierRoleCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class GrantSupplierRoleCommand extends Command<GrantSupplierRoleCommandResponse> {
	constructor(
		public readonly targetId: HederaId,
		public readonly tokenId: HederaId,
		public readonly amount: BigDecimal
	) {
		super();
	}
}
