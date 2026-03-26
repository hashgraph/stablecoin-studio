import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';
import { SerializedTransactionData } from '../../../../../../domain/context/transaction/TransactionResponse.js';

export class GrantUnlimitedSupplierRoleCommandResponse
	implements CommandResponse
{
	constructor(
		public readonly payload: boolean,
		public readonly transactionId?: string,
		public readonly serializedTransactionData?: SerializedTransactionData,
	) {}
}

export class GrantUnlimitedSupplierRoleCommand extends Command<GrantUnlimitedSupplierRoleCommandResponse> {
	constructor(
		public readonly targetId: HederaId,
		public readonly tokenId: HederaId,
	) {
		super();
	}
}
