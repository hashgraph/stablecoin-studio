/* eslint-disable @typescript-eslint/no-unused-vars */
import { singleton } from 'tsyringe';
import { CommandBus } from '../../core/command/CommandBus.js';
import { Injectable } from '../../core/Injectable.js';
import BigDecimal from '../../domain/context/shared/BigDecimal.js';
import { HederaId } from '../../domain/context/shared/HederaId.js';
import { StableCoin } from '../../domain/context/stablecoin/StableCoin.js';
import TransactionResponse from '../../domain/context/transaction/TransactionResponse.js';
import AccountService from './AccountService.js';
import Service from './Service.js';
import { CashInCommand } from '../usecase/stablecoin/cashin/CashInCommand.js';
import { EmptyValue } from './error/EmptyValue.js';

@singleton()
export default class StableCoinService extends Service {
	constructor(
		public readonly commandBus: CommandBus = Injectable.resolve<CommandBus>(
			CommandBus,
		),
		public readonly accountService: AccountService = Injectable.resolve<AccountService>(
			AccountService,
		),
	) {
		super();
	}

	wipe(
		accountId: string,
		tokenId: string,
		amount: Long,
	): Promise<TransactionResponse> {
		throw new Error('Method not impemented');
	}

	async mint(
		tokenId: string,
		amount: BigDecimal,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		const account = this.accountService.getCurrentAccount();
		const coin = new StableCoin({
			decimals: 6,
			name: 'HDC',
			symbol: 'HDC',
			proxyAddress: HederaId.from('0.0.1'),
			tokenId: HederaId.from('0.0.1'),
		});
		if (!coin.proxyAddress || !coin.tokenId) {
			throw new EmptyValue(
				!coin.proxyAddress ? 'proxyAddress' : 'tokenId',
			);
		}
		const result = await this.commandBus.execute(
			new CashInCommand(
				account,
				amount,
				coin.proxyAddress,
				targetId,
				coin.tokenId,
			),
		);
		return new TransactionResponse('00000.000001', result);
	}

	burn(coin: StableCoin, amount: Long): Promise<TransactionResponse> {
		throw new Error('Method not impemented');
	}

	freeze(coin: StableCoin, targetId: string): Promise<TransactionResponse> {
		throw new Error('Method not impemented');
	}

	unfreeze(coin: StableCoin, targetId: string): Promise<TransactionResponse> {
		throw new Error('Method not impemented');
	}

	pause(coin: StableCoin): Promise<TransactionResponse> {
		throw new Error('Method not impemented');
	}

	unpause(coin: StableCoin): Promise<TransactionResponse> {
		throw new Error('Method not impemented');
	}

	rescue(coin: StableCoin): Promise<TransactionResponse> {
		throw new Error('Method not impemented');
	}

	delete(coin: StableCoin): Promise<TransactionResponse> {
		throw new Error('Method not impemented');
	}
}
