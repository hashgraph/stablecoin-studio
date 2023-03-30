import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';
import { StableCoinRole } from '../../../../../../domain/context/stablecoin/StableCoinRole.js';

export class RevokeMultiRolesCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class RevokeMultiRolesCommand extends Command<RevokeMultiRolesCommandResponse> {
	constructor(
		public readonly roles: StableCoinRole[],
		public readonly targetsId: HederaId[],
		public readonly tokenId: HederaId,
	) {
		super();
	}
}
