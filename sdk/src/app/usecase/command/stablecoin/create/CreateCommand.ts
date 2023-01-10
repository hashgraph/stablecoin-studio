import { Command } from '../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../core/command/CommandResponse.js';
import ContractId from '../../../../../domain/context/contract/ContractId.js';
import { StableCoin, StableCoinProps } from '../../../../../domain/context/stablecoin/StableCoin.js';
import BigDecimal from '../../../../../domain/context/shared/BigDecimal.js';

export class CreateCommandResponse implements CommandResponse {
	constructor(public readonly tokenId: ContractId) {}
}

export class CreateCommand extends Command<CreateCommandResponse> {
	constructor(
		public readonly coin: StableCoinProps,
		public readonly factory: ContractId,
		public readonly hederaERC20: ContractId,
		public readonly createPoR: boolean,
		public readonly PoR?: ContractId,
		public readonly PoRInitialAmount?: BigDecimal,
	) {
		super();
	}
}
