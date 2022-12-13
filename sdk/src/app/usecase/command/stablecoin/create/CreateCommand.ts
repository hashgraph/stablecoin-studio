import { Command } from '../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../core/command/CommandResponse.js';
import ContractId from '../../../../../domain/context/contract/ContractId.js';
import { StableCoin } from '../../../../../domain/context/stablecoin/StableCoin.js';


export class CreateCommandResponse implements CommandResponse {
	constructor(public readonly tokenId: ContractId) {}
}

export class CreateCommand extends Command<CreateCommandResponse> {
	constructor(
		public readonly coin: StableCoin,
		public readonly factory: ContractId,
		public readonly hederaERC20: ContractId,
	) {
		super();
	}
}
