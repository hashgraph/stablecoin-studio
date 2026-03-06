import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';
import { StableCoinRole } from '../../../../../../domain/context/stablecoin/StableCoinRole.js';
import { SerializedTransactionData } from '../../../../../../domain/context/transaction/TransactionResponse.js';

export class GrantMultiRolesCommandResponse implements CommandResponse {
	constructor(
		public readonly payload: boolean,
		public readonly transactionId?: string,
		public readonly serializedTransactionData?: SerializedTransactionData,
	) {}
}

export class GrantMultiRolesCommand extends Command<GrantMultiRolesCommandResponse> {
	constructor(
		public readonly roles: StableCoinRole[],
		public readonly targetsId: HederaId[],
		public readonly amounts: string[],
		public readonly tokenId: HederaId,
		public readonly startDate?: string,
	) {
		super();
	}
}
