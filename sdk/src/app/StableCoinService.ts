/* eslint-disable @typescript-eslint/no-unused-vars */
import { injectable } from 'tsyringe';
import { CommandBus } from '../core/command/CommandBus.js';
import { Injectable } from '../core/Injectable.js';
import StableCoin from '../domain/context/stablecoin/StableCoin.js';
import Transaction from '../domain/context/transaction/Transaction.js';
import StableCoinRepository from '../port/out/stablecoin/StableCoinRepository.js';
import AccountService from './AccountService.js';
import Service from './service/Service.js';
import { CashInCommand } from './usecase/stablecoin/cashin/CashInCommand.js';

@injectable()
export default class StableCoinService extends Service {
	constructor(
		public readonly commandBus: CommandBus = Injectable.resolve<CommandBus>(
			'CommandBus',
		),
		public readonly accountService: AccountService = Injectable.resolve<AccountService>(
			AccountService,
		),
		public readonly stableCoinRepository: StableCoinRepository = Injectable.resolve<StableCoinRepository>(
			StableCoinRepository,
		),
	) {
		super();
	}

	wipe(
		accountId: string,
		tokenId: string,
		amount: Long,
	): Promise<Transaction> {
		throw new Error('Method not impemented');
	}

	async mint(
		tokenId: string,
		amount: string,
		targetId: string,
	): Promise<Transaction> {
		const account = this.accountService.getCurrentAccount();
		const coin = await this.stableCoinRepository.getCoin(tokenId);
		const result = await this.commandBus.execute(
			new CashInCommand(
				account,
				amount,
				coin.proxy.address,
				targetId,
				coin.tokenId,
			),
		);
		return new Transaction('00000.000001', result);
	}

	burn(coin: StableCoin, amount: Long): Promise<Transaction> {
		throw new Error('Method not impemented');
	}

	freeze(coin: StableCoin, targetId: string): Promise<Transaction> {
		throw new Error('Method not impemented');
	}

	unfreeze(coin: StableCoin, targetId: string): Promise<Transaction> {
		throw new Error('Method not impemented');
	}

	pause(coin: StableCoin): Promise<Transaction> {
		throw new Error('Method not impemented');
	}

	unpause(coin: StableCoin): Promise<Transaction> {
		throw new Error('Method not impemented');
	}

	rescue(coin: StableCoin): Promise<Transaction> {
		throw new Error('Method not impemented');
	}

	delete(coin: StableCoin): Promise<Transaction> {
		throw new Error('Method not impemented');
	}
}
