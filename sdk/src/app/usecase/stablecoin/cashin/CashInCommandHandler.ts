/* eslint-disable @typescript-eslint/no-explicit-any */
import { ICommandHandler } from '../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../core/decorator/CommandHandlerDecorator.js';
import StableCoinRepository from '../../../../port/out/stablecoin/StableCoinRepository.js';
import { CashInCommand, CashInCommandResponse } from './CashInCommand.js';

@CommandHandler(CashInCommand)
export class CashInCommandHandler implements ICommandHandler<CashInCommand> {
	constructor(
		public readonly repo: StableCoinRepository = new StableCoinRepository(),
	) {}

	execute(command: CashInCommand): Promise<CashInCommandResponse> {
		const res = new CashInCommandResponse(true);
		this.repo.map.set(command, res);
		// TODO Do some work here
		return Promise.resolve(res);
	}
}
