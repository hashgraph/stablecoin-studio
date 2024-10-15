import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import { CustomFee } from '../../../../../../domain/context/fee/CustomFee.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';

export class UpdateCustomFeesCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class UpdateCustomFeesCommand extends Command<UpdateCustomFeesCommandResponse> {
	constructor(
		public readonly tokenId: HederaId,
		public readonly customFees: CustomFee[],
	) {
		super();
	}
}
