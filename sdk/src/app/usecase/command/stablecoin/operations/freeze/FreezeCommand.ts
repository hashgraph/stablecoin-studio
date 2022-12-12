import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';
import Account from '../../../../../../domain/context/account/Account.js';

export class FreezeCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class FreezeCommand extends Command<FreezeCommandResponse> {
	constructor(
		public readonly targetId: Account,
		public readonly tokenId: HederaId,
	) {
		super();
	}
}
