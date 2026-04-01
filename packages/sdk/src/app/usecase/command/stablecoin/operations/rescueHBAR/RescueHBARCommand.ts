import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';
import { SerializedTransactionData } from '../../../../../../domain/context/transaction/TransactionResponse.js';

export class RescueHBARCommandResponse implements CommandResponse {
	constructor(
		public readonly payload: boolean,
		public readonly transactionId?: string,
		public readonly serializedTransactionData?: SerializedTransactionData,
	) {}
}

export class RescueHBARCommand extends Command<RescueHBARCommandResponse> {
	constructor(
		public readonly amount: string,
		public readonly tokenId: HederaId,
		public readonly startDate?: string,
	) {
		super();
	}
}
