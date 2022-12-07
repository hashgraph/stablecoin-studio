import { Command } from "../../../../../../core/command/Command.js";
import { CommandResponse } from "../../../../../../core/command/CommandResponse.js";
import { HederaId } from "../../../../../../domain/context/shared/HederaId.js";

export class GetRolesCommandResponse implements CommandResponse {
	constructor(public readonly payload: string[]) {}
}

export class GetRolesCommand extends Command<GetRolesCommandResponse> {
	constructor(
		public readonly targetId: HederaId,
		public readonly tokenId: HederaId,
	) {
		super();
	}
}
