import { ContractId as HContractId } from '@hashgraph/sdk';
import { ICommandHandler } from '../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator.js';
import ContractId from '../../../../../domain/context/contract/ContractId.js';
import { StableCoin } from '../../../../../domain/context/stablecoin/StableCoin.js';
import AccountService from '../../../../service/AccountService.js';
import TransactionService from '../../../../service/TransactionService.js';
import { CreateCommand, CreateCommandResponse } from './CreateCommand.js';

@CommandHandler(CreateCommand)
export class CreateCommandHandler implements ICommandHandler<CreateCommand> {
	constructor(
		@lazyInject(AccountService)
		public readonly accountService: AccountService,
		@lazyInject(TransactionService)
		public readonly transactionService: TransactionService,
	) {}

	async execute(command: CreateCommand): Promise<CreateCommandResponse> {
		const { coin, factory, hederaERC20 } = command;
		const handler = this.transactionService.getHandler();
		const res = await handler.create(
			new StableCoin(coin),
			factory,
			hederaERC20,
		);
		// TODO Do some work here
		return Promise.resolve(
			new CreateCommandResponse(
				ContractId.fromHederaContractId(
					HContractId.fromSolidityAddress(res.response[3]),
				),
			),
		);
	}
}
