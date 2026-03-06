import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import { CustomFee } from '../../../../../../domain/context/fee/CustomFee.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';
import { SerializedTransactionData } from '../../../../../../domain/context/transaction/TransactionResponse.js';

export class UpdateCustomFeesCommandResponse implements CommandResponse {
	constructor(
		public readonly payload: boolean,
		public readonly transactionId?: string,
		public readonly serializedTransactionData?: SerializedTransactionData,
	) {}
}

export class UpdateCustomFeesCommand extends Command<UpdateCustomFeesCommandResponse> {
	constructor(
		public readonly tokenId: HederaId,
		public readonly customFees: CustomFee[],
	) {
		super();
	}
}
