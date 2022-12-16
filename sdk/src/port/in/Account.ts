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
import { GetListStableCoinQuery } from '../../app/usecase/query/stablecoin/list/GetListStableCoinQuery.js';
import GetPublicKeyRequest from './request/GetPublicKeyRequest.js';
import PublicKey from '../../domain/context/account/PublicKey.js';
import { default as HederaAccount } from '../../domain/context/account/Account.js';
import StableCoinListViewModel from '../out/mirror/response/StableCoinListViewModel.js';
import AccountViewModel from '../out/mirror/response/AccountViewModel.js';
import { MirrorNodeAdapter } from '../out/mirror/MirrorNodeAdapter.js';
import { HederaId } from '../../domain/context/shared/HederaId.js';
import { GetAccountInfoQuery } from '../../app/usecase/query/account/info/GetAccountInfoQuery.js';

export { AccountViewModel, StableCoinListViewModel };

interface IAccountInPort {
	getPublicKey(request: GetPublicKeyRequest): Promise<PublicKey>;
	listStableCoins(
		request: GetListStableCoinRequest,
	): Promise<StableCoinListViewModel>;
	getInfo(request: GetAccountInfoRequest): Promise<AccountViewModel>;
}

class AccountInPort implements IAccountInPort {
	public readonly NullHederaAccount: HederaAccount = HederaAccount.NULL;
	public readonly NullPublicKey: PublicKey = PublicKey.NULL;

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

	async getPublicKey(request: GetPublicKeyRequest): Promise<PublicKey> {
		return (
			await this.queryBus.execute(
				new GetAccountInfoQuery(
					HederaId.from(request.account.accountId),
				),
			)
		).account.publicKey!;
	}

	async listStableCoins(
		request: GetListStableCoinRequest,
	): Promise<StableCoinListViewModel> {
		return (
			await this.queryBus.execute(
				new GetListStableCoinQuery(
					HederaId.from(request.account.accountId),
				),
			)
		).list;
	}

	async getInfo(request: GetAccountInfoRequest): Promise<AccountViewModel> {
		return (
			await this.queryBus.execute(
				new GetAccountInfoQuery(
					HederaId.from(request.account.accountId),
				),
			)
		).account;
	}

	isPublicKeyNull(val?: { key: string; type: string }): boolean {
		if (!val) return false;
		return (
			val.key === PublicKey.NULL.key && val.type === PublicKey.NULL.type
		);
	}
}

const Account = new AccountInPort();
export default Account;
