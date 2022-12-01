/* eslint-disable @typescript-eslint/no-explicit-any */
import { ICommandHandler } from '../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../core/decorator/CommandHandlerDecorator.js';
import { Injectable } from '../../../../../core/Injectable.js';
import { inject, delay } from 'tsyringe';
import {
	Access,
	Capability,
	Operation,
} from '../../../../../domain/context/stablecoin/Capability.js';
import AccountService from '../../../../service/AccountService.js';
import StableCoinService from '../../../../service/StableCoinService.js';
import { CashInCommand, CashInCommandResponse } from './CashInCommand.js';
import TransactionHandler from '../../../../../port/out/TransactionHandler.js';

@CommandHandler(CashInCommand)
export class CashInCommandHandler implements ICommandHandler<CashInCommand> {
	
	private handler: TransactionHandler;

	constructor(
		@inject(delay(() => StableCoinService))
		public readonly stableCoinService: StableCoinService,
		@inject(delay(() => AccountService))
		public readonly accountService: AccountService,
	) {}

	async execute(command: CashInCommand): Promise<CashInCommandResponse> {
		this.handler = Injectable.resolveTransactionhandler();
		const { amount, targetId, tokenId } = command;
		console.log(this.handler);
		const coin = await this.stableCoinService.get(tokenId);
		const account = this.accountService.getCurrentAccount();
		const res = await this.handler.cashin(
			{
				account: account,
				capabilities: [
					new Capability(Operation.CASH_IN, Access.CONTRACT),
				],
				coin: coin,
			},
			targetId.value,
			amount,
		);
		// TODO Do some work here
		return Promise.resolve(res.response);
	}
}
