/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '../../core/Injectable.js';
import NetworkService from '../../app/service/NetworkService.js';
import { QueryBus } from '../../core/query/QueryBus.js';
import { CommandBus } from '../../core/command/CommandBus.js';
import TransactionService from '../../app/service/TransactionService.js';
import {
	GetAccountBalanceRequest,
	GetAccountInfoRequest,
	GetListStableCoinRequest,
} from './request/index.js';
import StableCoinList from './response/StableCoinList.js';
import AccountInfo from './response/AccountInfo.js';
import GetPublicKeyRequest from './request/GetPublicKeyRequest.js';
import PublicKey from '../../domain/context/account/PublicKey.js';
import { Balance } from '../../domain/context/stablecoin/Balance.js';

interface IAccountInPort {
	getPublicKey(request: GetPublicKeyRequest): Promise<PublicKey>;
	getBalanceOf(request: GetAccountBalanceRequest): Promise<Balance>;
	listStableCoins(request: GetListStableCoinRequest): Promise<StableCoinList>;
	getInfo(request: GetAccountInfoRequest): Promise<AccountInfo>;
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
		private readonly transactionService: TransactionService = Injectable.resolve(
			TransactionService,
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
	): Promise<StableCoinList> {
		throw new Error('Method not implemented.');
	}
	getInfo(request: GetAccountInfoRequest): Promise<AccountInfo> {
		throw new Error('Method not implemented.');
	}
}

const Account = new AccountInPort();
export default Account;
