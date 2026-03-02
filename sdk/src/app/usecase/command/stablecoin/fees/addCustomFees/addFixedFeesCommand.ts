import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';
import { SerializedTransactionData } from '../../../../../../domain/context/transaction/TransactionResponse.js';

export class addFixedFeesCommandResponse implements CommandResponse {
	constructor(
		public readonly payload: boolean,
		public readonly transactionId?: string,
		public readonly serializedTransactionData?: SerializedTransactionData,
	) {}
}

export class addFixedFeesCommand extends Command<addFixedFeesCommandResponse> {
	constructor(
		public readonly tokenId: HederaId,
		public readonly collectorId: HederaId,
		public readonly tokenIdCollected: HederaId,
		public readonly amount: BigDecimal,
		public readonly collectorsExempt: boolean,
	) {
		super();
	}
}
