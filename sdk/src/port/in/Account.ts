/* eslint-disable @typescript-eslint/no-unused-vars */
import Injectable from '../../core/Injectable.js';
import NetworkService from '../../app/service/NetworkService.js';
import { QueryBus } from '../../core/query/QueryBus.js';
import { CommandBus } from '../../core/command/CommandBus.js';
import {
	GetAccountBalanceRequest,
	GetAccountInfoRequest,
	GetListStableCoinRequest,
} from './request/index.js';
import GetPublicKeyRequest from './request/GetPublicKeyRequest.js';
import PublicKey from '../../domain/context/account/PublicKey.js';
import { Balance } from '../../domain/context/stablecoin/Balance.js';
import StableCoinListViewModel from '../out/mirror/response/StableCoinListViewModel.js';
import AccountViewModel from '../out/mirror/response/AccountViewModel.js';
import { MirrorNodeAdapter } from '../out/mirror/MirrorNodeAdapter.js';

export { AccountViewModel, Balance};

interface IAccountInPort {
	getPublicKey(request: GetPublicKeyRequest): Promise<PublicKey>;
	getBalanceOf(request: GetAccountBalanceRequest): Promise<Balance>;
	listStableCoins(
		request: GetListStableCoinRequest,
	): Promise<StableCoinListViewModel>;
	getInfo(request: GetAccountInfoRequest): Promise<AccountViewModel>;
}

class AccountInPort implements IAccountInPort {
	constructor(
		private readonly networkService: NetworkService = Injectable.resolve(
			NetworkService,
		),
		private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
		private readonly commandBus: CommandBus = Injectable.resolve(
			CommandBus,
		),
		private readonly mirrorClient: MirrorNodeAdapter = Injectable.resolve(
			MirrorNodeAdapter,
		),
	) {}
	getPublicKey(request: GetPublicKeyRequest): Promise<PublicKey> {
		throw new Error('Method not implemented.');
	}
	getBalanceOf(request: GetAccountBalanceRequest): Promise<Balance> {
		throw new Error('Method not implemented.');
	}
	listStableCoins(
		request: GetListStableCoinRequest,
	): Promise<StableCoinListViewModel> {
		throw new Error('Method not implemented.');
	}
	getInfo(request: GetAccountInfoRequest): Promise<AccountViewModel> {
		throw new Error('Method not implemented.');
	}
}

const Account = new AccountInPort();
export default Account;
