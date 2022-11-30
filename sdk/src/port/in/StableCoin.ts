/* eslint-disable @typescript-eslint/no-unused-vars */
import Service from '../../app/service/Service.js';
import StableCoinService from '../../app/service/StableCoinService.js';
import { Injectable } from '../../core/Injectable.js';
import CreateRequest from './request/CreateRequest.js';
import CashInRequest from './request/CashInRequest.js';
import GetStableCoinDetailsRequest from './request/GetStableCoinDetailsRequest.js';
import CashOutRequest from './request/CashOutRequest.js';
import RescueRequest from './request/RescueRequest.js';
import WipeRequest from './request/WipeRequest.js';
import StableCoinDetail from './response/StableCoinDetail.js';
import BigDecimal from '../../domain/context/shared/BigDecimal.js';
import { HederaId } from '../../domain/context/shared/HederaId.js';
import NetworkService from '../../app/service/NetworkService.js';

interface IStableCoinInPort {
	create(request: CreateRequest): Promise<StableCoinDetail>;
	getInfo(request: GetStableCoinDetailsRequest): Promise<StableCoinDetail>;
	cashIn(request: CashInRequest): Promise<boolean>;
	cashOut(request: CashOutRequest): Promise<boolean>;
	rescue(request: RescueRequest): Promise<boolean>;
	wipe(request: WipeRequest): Promise<boolean>;
}

class StableCoinInPort implements IStableCoinInPort {
	constructor(
		private readonly networkService: NetworkService = Injectable.resolve<NetworkService>(
			NetworkService,
		),
		private readonly stableCoinService: StableCoinService = Injectable.resolve(
			StableCoinService,
		),
	) {}
	create(request: CreateRequest): Promise<StableCoinDetail> {
		throw new Error('Method not implemented.');
	}
	getInfo(request: GetStableCoinDetailsRequest): Promise<StableCoinDetail> {
		throw new Error('Method not implemented.');
	}
	async cashIn({
		tokenId,
		amount,
		targetId,
	}: CashInRequest): Promise<boolean> {
		return !!(await this.stableCoinService.mint(
			tokenId,
			BigDecimal.fromString(amount),
			HederaId.from(targetId),
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
}

const StableCoin = new StableCoinInPort();
export default StableCoin;
