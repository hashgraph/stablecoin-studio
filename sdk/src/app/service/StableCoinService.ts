/* eslint-disable @typescript-eslint/no-unused-vars */
import { singleton } from 'tsyringe';
import { Injectable } from '../../core/Injectable.js';
import AccountService from './AccountService.js';
import Service from './Service.js';
import { QueryBus } from '../../core/query/QueryBus.js';
import { HederaId } from '../../domain/context/shared/HederaId.js';
import { StableCoin } from '../../domain/context/stablecoin/StableCoin.js';
import { GetStableCoinQuery } from '../usecase/query/stablecoin/GetStableCoinQuery.js';
import StableCoinCapabilities from '../../domain/context/stablecoin/StableCoinCapabilities.js';
import {
	Access,
	Capability,
	Operation,
} from '../../domain/context/stablecoin/Capability.js';
import Account from '../../domain/context/account/Account.js';

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

	async getCapabilities(
		account: Account,
		target: HederaId | StableCoin,
	): Promise<StableCoinCapabilities> {
		const mockCapabilities = [
			new Capability(Operation.BURN, Access.CONTRACT),
		];
		let _coin: StableCoin;
		if (target instanceof StableCoin) {
			_coin = target;
		} else {
			_coin = await this.get(target);
		}
		return new StableCoinCapabilities(_coin, mockCapabilities, account);
	}
}
