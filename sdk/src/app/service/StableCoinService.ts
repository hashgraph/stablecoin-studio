/* eslint-disable @typescript-eslint/no-unused-vars */
import { singleton } from 'tsyringe';
import Injectable from '../../core/Injectable.js';
import AccountService from './AccountService.js';
import Service from './Service.js';
import { QueryBus } from '../../core/query/QueryBus.js';
import { HederaId } from '../../domain/context/shared/HederaId.js';
import StableCoinCapabilities from '../../domain/context/stablecoin/StableCoinCapabilities.js';
import {
	Access,
	Capability,
	Operation,
} from '../../domain/context/stablecoin/Capability.js';
import Account from '../../domain/context/account/Account.js';
import { StableCoin } from '../../domain/context/stablecoin/StableCoin.js';
import PublicKey from '../../domain/context/account/PublicKey.js';
import { GetStableCoinQuery } from '../usecase/query/stablecoin/get/GetStableCoinQuery.js';
import { StableCoinNotFound } from '../../port/out/mirror/error/StableCoinNotFound.js';

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
		const viewModel = (
			await this.queryBus.execute(new GetStableCoinQuery(tokenId))
		).coin;
		const { name, decimals, symbol } = viewModel;
		if (!name || !decimals || !symbol)
			throw new StableCoinNotFound(tokenId);
		return new StableCoin({ ...viewModel, name, decimals, symbol });
	}

	async getCapabilities(
		account: Account,
		target: HederaId | StableCoin,
	): Promise<StableCoinCapabilities> {
		try {
			let _coin: StableCoin;
			const listCapabilities: Capability[] = [];

			if (target instanceof StableCoin) {
				_coin = target;
			} else {
				_coin = await this.get(target);
			}

			const paused = _coin.paused;
			const deleted = _coin.deleted;
			const operable = !deleted && !paused;

			if (
				operable &&
				_coin.proxyAddress?.toString() === _coin.treasury?.toString()
			) {
				listCapabilities.push(
					new Capability(Operation.RESCUE, Access.CONTRACT),
				);
			}

			if (
				operable &&
				_coin.supplyKey?.toString() === _coin.treasury?.toString()
			) {
				listCapabilities.push(
					new Capability(Operation.CASH_IN, Access.CONTRACT),
				);
				listCapabilities.push(
					new Capability(Operation.BURN, Access.CONTRACT),
				);
			}

			if (operable && _coin.supplyKey instanceof PublicKey) {
				if (
					_coin.supplyKey?.key.toString() ===
					account.publicKey?.toString()
				) {
					listCapabilities.push(
						new Capability(Operation.CASH_IN, Access.HTS),
					);
					listCapabilities.push(
						new Capability(Operation.BURN, Access.HTS),
					);
				}
			}

			if (operable && _coin.wipeKey instanceof PublicKey) {
				if (
					_coin.wipeKey?.key.toString() ===
					account.publicKey?.toString()
				) {
					listCapabilities.push(
						new Capability(Operation.WIPE, Access.HTS),
					);
				}
			}
			if (operable && _coin.wipeKey instanceof HederaId) {
				listCapabilities.push(
					new Capability(Operation.WIPE, Access.CONTRACT),
				);
			}

			if (!deleted && _coin.pauseKey instanceof PublicKey) {
				if (
					_coin.pauseKey?.key.toString() ===
					account.publicKey?.toString()
				) {
					listCapabilities.push(
						new Capability(Operation.PAUSE, Access.HTS),
					);
				}
			}
			if (!deleted && _coin.pauseKey instanceof HederaId) {
				listCapabilities.push(
					new Capability(Operation.PAUSE, Access.CONTRACT),
				);
			}

			if (operable && _coin.freezeKey instanceof PublicKey) {
				if (
					_coin.freezeKey?.key.toString() ===
					account.publicKey?.toString()
				) {
					listCapabilities.push(
						new Capability(Operation.FREEZE, Access.HTS),
					);
				}
			}
			if (operable && _coin.freezeKey instanceof HederaId) {
				listCapabilities.push(
					new Capability(Operation.FREEZE, Access.CONTRACT),
				);
			}

			if (operable && _coin.adminKey instanceof PublicKey) {
				if (
					_coin.adminKey?.key.toString() ===
					account.publicKey?.toString()
				) {
					listCapabilities.push(
						new Capability(Operation.DELETE, Access.HTS),
					);
				}
			}
			if (operable && _coin.adminKey instanceof HederaId) {
				listCapabilities.push(
					new Capability(Operation.DELETE, Access.CONTRACT),
				);
			}

			const roleManagement = listCapabilities.some((capability) =>
				[
					new Capability(Operation.PAUSE, Access.CONTRACT),
					new Capability(Operation.WIPE, Access.CONTRACT),
					new Capability(Operation.CASH_IN, Access.CONTRACT),
					new Capability(Operation.BURN, Access.CONTRACT),
					new Capability(Operation.RESCUE, Access.CONTRACT),
					new Capability(Operation.FREEZE, Access.CONTRACT),
					new Capability(Operation.DELETE, Access.CONTRACT),
				].includes(capability),
			);
			if (roleManagement) {
				listCapabilities.push(
					new Capability(Operation.ROLE_MANAGEMENT, Access.CONTRACT),
				);
			}
			return new StableCoinCapabilities(_coin, listCapabilities, account);
		} catch (error) {
			return Promise.reject(error);
		}
	}
}
