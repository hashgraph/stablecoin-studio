/* eslint-disable @typescript-eslint/no-unused-vars */
import Injectable from '../../core/Injectable.js';
import CreateRequest from './request/CreateRequest.js';
import CashInRequest from './request/CashInRequest.js';
import GetStableCoinDetailsRequest from './request/GetStableCoinDetailsRequest.js';
import CashOutRequest from './request/CashOutRequest.js';
import RescueRequest from './request/RescueRequest.js';
import WipeRequest from './request/WipeRequest.js';
import AssociateTokenRequest from './request/AssociateTokenRequest.js';
import BigDecimal from '../../domain/context/shared/BigDecimal.js';
import { HederaId } from '../../domain/context/shared/HederaId.js';
import ContractId from '../../domain/context/contract/ContractId.js';
import { StableCoin as StableCoinObject } from '../../domain/context/stablecoin/StableCoin.js';
import NetworkService from '../../app/service/NetworkService.js';
import { QueryBus } from '../../core/query/QueryBus.js';
import { CommandBus } from '../../core/command/CommandBus.js';
import { CashInCommand } from '../../app/usecase/command/stablecoin/operations/cashin/CashInCommand.js';
import StableCoinViewModel from '../out/mirror/response/StableCoinViewModel.js';
import StableCoinListViewModel from '../out/mirror/response/StableCoinListViewModel.js';
import StableCoinService from '../../app/service/StableCoinService.js';
import { GetStableCoinQuery } from '../../app/usecase/query/stablecoin/get/GetStableCoinQuery.js';
import AccountService from '../../app/service/AccountService.js';
import { CreateCommand } from '../../app/usecase/command/stablecoin/create/CreateCommand.js';
import PublicKey from '../../domain/context/account/PublicKey.js';
import DeleteRequest from './request/DeleteRequest.js';
import FreezeAccountRequest from './request/FreezeAccountRequest.js';
import PauseRequest from './request/PauseRequest.js';
import GetAccountBalanceRequest from './request/GetAccountBalanceRequest.js';
import CapabilitiesRequest from './request/CapabilitiesRequest.js';
import { Balance } from '../../domain/context/stablecoin/Balance.js';
import StableCoinCapabilities from '../../domain/context/stablecoin/StableCoinCapabilities.js';
import { Capability, Access, Operation } from '../../domain/context/stablecoin/Capability.js';
import { TokenSupplyType } from '../../domain/context/stablecoin/TokenSupply.js';

export const HederaERC20AddressTestnet = '0.0.49077027';
export const HederaERC20AddressPreviewnet = '0.0.11111111';

export const FactoryAddressTestnet = '0.0.49077033';
export const FactoryAddressPreviewnet = '0.0.11111111';

export { StableCoinViewModel, StableCoinListViewModel };
export { StableCoinCapabilities, Capability, Access, Operation };
export { TokenSupplyType };

interface IStableCoinInPort {
	create(request: CreateRequest): Promise<StableCoinViewModel>;
	getInfo(request: GetStableCoinDetailsRequest): Promise<StableCoinViewModel>;
	cashIn(request: CashInRequest): Promise<boolean>;
	cashOut(request: CashOutRequest): Promise<boolean>;
	rescue(request: RescueRequest): Promise<boolean>;
	wipe(request: WipeRequest): Promise<boolean>;
	associate(request: AssociateTokenRequest): Promise<boolean>;
	getBalanceOf(request: GetAccountBalanceRequest): Promise<Balance>;
	capabilities(request: CapabilitiesRequest): Promise<StableCoinCapabilities>;
	pause(request: PauseRequest): Promise<boolean>;
	unPause(request: PauseRequest): Promise<boolean>;
	delete(request: DeleteRequest): Promise<boolean>;
	freeze(request: FreezeAccountRequest): Promise<boolean>;
	unFreeze(request: FreezeAccountRequest): Promise<boolean>;
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

	async create(req: CreateRequest): Promise<StableCoinViewModel> {
		const validation = req.validate();
		if (validation.length > 0) throw new Error('validation error');

		const { stableCoinFactory, hederaERC20 } = req;

		const coin: StableCoinObject = new StableCoinObject({
			name: req.name,
			symbol: req.symbol,
			decimals: req.decimals,
			adminKey: req.adminKey
				? new PublicKey({
						key: req.adminKey.key,
						type: req.adminKey.type,
				  })
				: PublicKey.NULL,
			initialSupply: BigDecimal.fromString(req.initialSupply ?? '0'),
			maxSupply: BigDecimal.fromString(req.maxSupply ?? '0'),
			freezeKey: req.freezeKey
				? new PublicKey({
						key: req.freezeKey.key,
						type: req.freezeKey.type,
				  })
				: PublicKey.NULL,
			freezeDefault: req.freezeDefault,
			kycKey: req.KYCKey
				? new PublicKey({ key: req.KYCKey.key, type: req.KYCKey.type })
				: PublicKey.NULL,
			wipeKey: req.wipeKey
				? new PublicKey({
						key: req.wipeKey.key,
						type: req.wipeKey.type,
				  })
				: PublicKey.NULL,
			pauseKey: req.pauseKey
				? new PublicKey({
						key: req.pauseKey.key,
						type: req.pauseKey.type,
				  })
				: PublicKey.NULL,
			supplyKey: req.supplyKey
				? new PublicKey({
						key: req.supplyKey.key,
						type: req.supplyKey.type,
				  })
				: PublicKey.NULL,
			treasury: new HederaId(req.treasury ?? '0.0.0'),
			supplyType: req.supplyType,
			autoRenewAccount: new HederaId(req.autoRenewAccount!),
		});

		const createResponse = await this.commandBus.execute(
			new CreateCommand(
				coin,
				new ContractId(stableCoinFactory),
				new ContractId(hederaERC20),
			),
		);

		return (
			await this.queryBus.execute(
				new GetStableCoinQuery(createResponse.tokenId),
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
	associate(request: AssociateTokenRequest): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
	getBalanceOf(request: GetAccountBalanceRequest): Promise<Balance> {
		throw new Error('Method not implemented.');
	}
	capabilities(
		request: CapabilitiesRequest,
	): Promise<StableCoinCapabilities> {
		throw new Error('Method not implemented.');
	}
	pause(request: PauseRequest): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
	unPause(request: PauseRequest): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
	delete(request: DeleteRequest): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
	freeze(request: FreezeAccountRequest): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
	unFreeze(request: FreezeAccountRequest): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
}

const StableCoin = new StableCoinInPort();
export default StableCoin;
