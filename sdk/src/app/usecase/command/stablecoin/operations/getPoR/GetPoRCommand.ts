import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';

export class GetPoRCommandResponse implements CommandResponse {
	constructor(public readonly payload: string) {}
}

export class GetPoRCommand extends Command<GetPoRCommandResponse> {
	constructor(
		public readonly tokenId: HederaId
	) {
		super();
	}
}
