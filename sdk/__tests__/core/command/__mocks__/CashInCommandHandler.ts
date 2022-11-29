/* eslint-disable @typescript-eslint/no-explicit-any */
import { Command } from '../../../../src/core/command/Command.js';
import { ICommandHandler } from '../../../../src/core/command/CommandHandler.js';
import { CommandResponse } from '../../../../src/core/command/CommandResponse.js';
import { CommandHandler } from '../../../../src/core/decorator/CommandHandlerDecorator.js';

export class CashInCommandResponse implements CommandResponse {
	constructor(public readonly payload: boolean) {}
}

export class CashInCommand extends Command<CashInCommandResponse> {
	constructor(
		public readonly account: { id: string; privateKey?: string },
		public readonly amount: string,
		public readonly proxyContractId: string,
		public readonly targetId: string,
		public readonly tokenId: string,
	) {
		super();
	}
}

export class StableCoinRepository {
	public map = new Map<CashInCommand, CashInCommandResponse>();
}

@CommandHandler(CashInCommand)
export class CashInCommandHandler implements ICommandHandler<CashInCommand> {
	constructor(
		public readonly repo: StableCoinRepository = new StableCoinRepository(),
	) {}

	execute(command: CashInCommand): Promise<CashInCommandResponse> {
		const res = new CashInCommandResponse(true);
		this.repo.map.set(command, res);
		// Do some work here
		return Promise.resolve(res);
	}
}
