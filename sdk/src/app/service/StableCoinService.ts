/* eslint-disable @typescript-eslint/no-unused-vars */
import { singleton } from 'tsyringe';
import { Injectable } from '../../core/Injectable.js';
import AccountService from './AccountService.js';
import Service from './Service.js';
import { QueryBus } from '../../core/query/QueryBus.js';
import { HederaId } from '../../domain/context/shared/HederaId.js';
import { StableCoin } from '../../domain/context/stablecoin/StableCoin.js';
import { GetStableCoinQuery } from '../usecase/query/stablecoin/GetStableCoinQuery.js';

@singleton()
export default class StableCoinService extends Service {
	constructor(
		public readonly queryBus: QueryBus = Injectable.resolve<QueryBus>(
			QueryBus,
		),
		public readonly accountService: AccountService = Injectable.resolve<AccountService>(
			AccountService,
		),
	) {
		super();
	}

	async get(tokenId: HederaId): Promise<StableCoin> {
		return (await this.queryBus.execute(new GetStableCoinQuery(tokenId)))
			.coin;
	}
}
