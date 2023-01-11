import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import ContractId from '../../../../../../domain/context/contract/ContractId.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';

export class UpdatePoRCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class UpdatePoRCommand extends Command<UpdatePoRCommandResponse> {
	constructor(
		public readonly tokenId: HederaId,
        public readonly PoR: ContractId
	) {
		super();
	}
}
