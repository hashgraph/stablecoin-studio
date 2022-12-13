/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '../../core/Injectable.js';
import CreateRequest from './request/CreateRequest.js';
import CashInRequest from './request/CashInRequest.js';
import GetStableCoinDetailsRequest from './request/GetStableCoinDetailsRequest.js';
import CashOutRequest from './request/CashOutRequest.js';
import RescueRequest from './request/RescueRequest.js';
import WipeRequest from './request/WipeRequest.js';
import BigDecimal from '../../domain/context/shared/BigDecimal.js';
import { HederaId } from '../../domain/context/shared/HederaId.js';
import NetworkService from '../../app/service/NetworkService.js';
import { QueryBus } from '../../core/query/QueryBus.js';
import { CommandBus } from '../../core/command/CommandBus.js';
import { CashInCommand } from '../../app/usecase/command/stablecoin/operations/cashin/CashInCommand.js';
import StableCoinViewModel from '../out/mirror/response/StableCoinViewModel.js';
import StableCoinService from '../../app/service/StableCoinService.js';
import { GetStableCoinQuery } from '../../app/usecase/query/stablecoin/get/GetStableCoinQuery.js';
import AccountService from '../../app/service/AccountService.js';
import DeleteRequest from './request/DeleteRequest.js';
import FreezeAccountRequest from './request/FreezeAccountRequest.js';
import PauseRequest from './request/PauseRequest.js';

interface IStableCoinInPort {
	create(request: CreateRequest): Promise<StableCoinViewModel>;
	getInfo(request: GetStableCoinDetailsRequest): Promise<StableCoinViewModel>;
	cashIn(request: CashInRequest): Promise<boolean>;
	cashOut(request: CashOutRequest): Promise<boolean>;
	rescue(request: RescueRequest): Promise<boolean>;
	wipe(request: WipeRequest): Promise<boolean>;
	pause(request: PauseRequest): Promise<boolean>;
	unPause(request: PauseRequest): Promise<boolean>;
	delete(request: DeleteRequest): Promise<boolean>;
	freeze(request: FreezeAccountRequest): Promise<boolean>;
	unFrezze(request: FreezeAccountRequest): Promise<boolean>;
}

class StableCoinInPort implements IStableCoinInPort {
	constructor(
		private readonly networkService: NetworkService = Injectable.resolve<NetworkService>(
			NetworkService,
		),
		private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
		private readonly commandBus: CommandBus = Injectable.resolve(
			CommandBus,
		),
		private readonly stableCoinService: StableCoinService = Injectable.resolve(
			StableCoinService,
		),
		private readonly accountService: AccountService = Injectable.resolve(
			AccountService,
		),
	) {}

	async create(request: CreateRequest): Promise<StableCoinViewModel> {
		// Create
		return (
			await this.queryBus.execute(
				new GetStableCoinQuery(HederaId.from('0.0.0')),
			)
		).coin;
	}

	async getInfo(
		request: GetStableCoinDetailsRequest,
	): Promise<StableCoinViewModel> {
		const { id } = request;
		const validation = request.validate();
		// TODO return validation
		if (validation.length > 0) throw new Error('Validation error');
		return (
			await this.queryBus.execute(
				new GetStableCoinQuery(HederaId.from(id)),
			)
		).coin;
	}

	async cashIn(request: CashInRequest): Promise<boolean> {
		const { tokenId, amount, targetId } = request;
		const validation = request.validate();
		// TODO return validation
		if (validation.length > 0) return false;

		return !!(await this.commandBus.execute(
			new CashInCommand(
				BigDecimal.fromString(amount),
				HederaId.from(targetId),
				HederaId.from(tokenId),
			),
		));
	}

	cashOut(request: CashOutRequest): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
	rescue(request: RescueRequest): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
	wipe(request: WipeRequest): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
	pause(request: PauseRequest): Promise<boolean> {
		throw new Error('Method not implemented');
	}
	unPause(request: PauseRequest): Promise<boolean> {
		throw new Error('Method not implemented');
	}
	delete(request: DeleteRequest): Promise<boolean> {
		throw new Error('Method not implemented');
	}
	freeze(request: FreezeAccountRequest): Promise<boolean> {
		throw new Error('Method not implemented');
	}
	unFrezze(request: FreezeAccountRequest): Promise<boolean> {
		throw new Error('Method not implemented');
	}
}

const StableCoin = new StableCoinInPort();
export default StableCoin;
