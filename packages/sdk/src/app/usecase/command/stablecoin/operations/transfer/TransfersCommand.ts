import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';
import { SerializedTransactionData } from '../../../../../../domain/context/transaction/TransactionResponse.js';

export class TransfersCommandResponse implements CommandResponse {
	constructor(
		public readonly payload: boolean,
		public readonly transactionId?: string,
		public readonly serializedTransactionData?: SerializedTransactionData,
	) {}
}

export class TransfersCommand extends Command<TransfersCommandResponse> {
	constructor(
		public readonly amounts: string[],
		public readonly targetsIds: HederaId[],
		public readonly tokenId: HederaId,
		public readonly targetId: HederaId,
	) {
		super();
	}
}
