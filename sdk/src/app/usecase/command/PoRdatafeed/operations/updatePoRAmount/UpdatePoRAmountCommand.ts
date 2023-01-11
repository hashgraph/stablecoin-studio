import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import ContractId from '../../../../../../domain/context/contract/ContractId.js';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';

export class UpdatePoRAmountCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class UpdatePoRAmountCommand extends Command<UpdatePoRAmountCommandResponse> {
	constructor(
		public readonly tokenId: HederaId,
		public readonly PoR: ContractId,
        public readonly PoRAmount: BigDecimal
	) {
		super();
	}
}
