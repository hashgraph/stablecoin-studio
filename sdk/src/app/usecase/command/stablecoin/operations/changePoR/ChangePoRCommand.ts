import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import ContractId from '../../../../../../domain/context/contract/ContractId.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';

export class ChangePoRCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class ChangePoRCommand extends Command<ChangePoRCommandResponse> {
	constructor(
		public readonly tokenId: HederaId,
        public readonly PoR: ContractId
	) {
		super();
	}
}
