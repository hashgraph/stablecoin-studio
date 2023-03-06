import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';

export class TransferCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class TransferCommand extends Command<TransferCommandResponse> {
	constructor(
		public readonly amounts: string[],
		public readonly targetIds: HederaId[],
		public readonly tokenId: HederaId,
	) {
		super();
	}
}
