/* eslint-disable @typescript-eslint/no-unused-vars */
import Injectable from '../../core/Injectable.js';
import CreateRequest from './request/CreateRequest.js';
import CashInRequest from './request/CashInRequest.js';
import GetStableCoinDetailsRequest from './request/GetStableCoinDetailsRequest.js';
import BurnRequest from './request/BurnRequest.js';
import RescueRequest from './request/RescueRequest.js';
import WipeRequest from './request/WipeRequest.js';
import AssociateTokenRequest from './request/AssociateTokenRequest.js';
import BigDecimal from '../../domain/context/shared/BigDecimal.js';
import { HederaId } from '../../domain/context/shared/HederaId.js';
import ContractId from '../../domain/context/contract/ContractId.js';
import {
	StableCoinProps,
} from '../../domain/context/stablecoin/StableCoin.js';
import { QueryBus } from '../../core/query/QueryBus.js';
import { CommandBus } from '../../core/command/CommandBus.js';
import { CashInCommand } from '../../app/usecase/command/stablecoin/operations/cashin/CashInCommand.js';
import StableCoinViewModel from '../out/mirror/response/StableCoinViewModel.js';
import StableCoinListViewModel from '../out/mirror/response/StableCoinListViewModel.js';
import StableCoinService from '../../app/service/StableCoinService.js';
import { GetStableCoinQuery } from '../../app/usecase/query/stablecoin/get/GetStableCoinQuery.js';
import { CreateCommand } from '../../app/usecase/command/stablecoin/create/CreateCommand.js';
import PublicKey from '../../domain/context/account/PublicKey.js';
import DeleteRequest from './request/DeleteRequest.js';
import FreezeAccountRequest from './request/FreezeAccountRequest.js';
import PauseRequest from './request/PauseRequest.js';
import GetAccountBalanceRequest from './request/GetAccountBalanceRequest.js';
import CapabilitiesRequest from './request/CapabilitiesRequest.js';
import { Balance } from '../../domain/context/stablecoin/Balance.js';
import StableCoinCapabilities from '../../domain/context/stablecoin/StableCoinCapabilities.js';
import {
	Capability,
	Access,
	Operation,
} from '../../domain/context/stablecoin/Capability.js';
import { TokenSupplyType } from '../../domain/context/stablecoin/TokenSupply.js';
import Account from '../../domain/context/account/Account.js';
import { BurnCommand } from '../../app/usecase/command/stablecoin/operations/burn/BurnCommand.js';
import { BalanceOfCommand } from '../../app/usecase/command/stablecoin/operations/balanceof/BalanceOfCommand.js';
import { RescueCommand } from '../../app/usecase/command/stablecoin/operations/rescue/RescueCommand.js';
import { WipeCommand } from '../../app/usecase/command/stablecoin/operations/wipe/WipeCommand.js';
import { PauseCommand } from '../../app/usecase/command/stablecoin/operations/pause/PauseCommand.js';
import { UnPauseCommand } from '../../app/usecase/command/stablecoin/operations/unpause/UnPauseCommand.js';
import { DeleteCommand } from '../../app/usecase/command/stablecoin/operations/delete/DeleteCommand.js';
import { FreezeCommand } from '../../app/usecase/command/stablecoin/operations/freeze/FreezeCommand.js';
import { UnFreezeCommand } from '../../app/usecase/command/stablecoin/operations/unfreeze/UnFreezeCommand.js';

export const HederaERC20AddressTestnet = '0.0.49094604';
export const HederaERC20AddressPreviewnet = '0.0.11111111';

export const FactoryAddressTestnet = '0.0.49094610';
export const FactoryAddressPreviewnet = '0.0.11111111';

export { StableCoinViewModel, StableCoinListViewModel };
export { StableCoinCapabilities, Capability, Access, Operation, Balance };
export { TokenSupplyType };

interface IStableCoinInPort {
	create(request: CreateRequest): Promise<StableCoinViewModel>;
	getInfo(request: GetStableCoinDetailsRequest): Promise<StableCoinViewModel>;
	cashIn(request: CashInRequest): Promise<boolean>;
	burn(request: BurnRequest): Promise<boolean>;
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
		private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
		private readonly commandBus: CommandBus = Injectable.resolve(
			CommandBus,
		),
		private readonly stableCoinService: StableCoinService = Injectable.resolve(
			StableCoinService,
		),
	) {}

	async create(req: CreateRequest): Promise<StableCoinViewModel> {
		const validation = req.validate();
		if (validation.length > 0) throw new Error('validation error');

		const { stableCoinFactory, hederaERC20 } = req;

		const coin: StableCoinProps = {
			name: req.name,
			symbol: req.symbol,
			decimals: req.decimals,
			adminKey: req.adminKey
				? new PublicKey({
						key: req.adminKey.key,
						type: req.adminKey.type,
				  })
				: PublicKey.NULL,
			initialSupply: BigDecimal.fromString(
				req.initialSupply ?? '0',
				req.decimals,
			),
			maxSupply: BigDecimal.fromString(
				req.maxSupply ?? '0',
				req.decimals,
			),
			freezeKey: req.freezeKey
				? new PublicKey({
						key: req.freezeKey.key,
						type: req.freezeKey.type,
				  })
				: PublicKey.NULL,
			freezeDefault: req.freezeDefault,
			// kycKey: req.KYCKey
			// 	? new PublicKey({ key: req.KYCKey.key, type: req.KYCKey.type })
			// 	: PublicKey.NULL,
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
			autoRenewAccount: req.autoRenewAccount
				? new HederaId(req.autoRenewAccount)
				: undefined,
		};

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

		return (
			await this.commandBus.execute(
				new CashInCommand(
					amount,
					HederaId.from(targetId),
					HederaId.from(tokenId),
				),
			)
		).payload;
	}

	async burn(request: BurnRequest): Promise<boolean> {
		const { tokenId, amount } = request;
		const validation = request.validate();
		// TODO return validation
		if (validation.length > 0) return false;

		return (
			await this.commandBus.execute(
				new BurnCommand(amount, HederaId.from(tokenId)),
			)
		).payload;
	}

	async rescue(request: RescueRequest): Promise<boolean> {
		const { tokenId, amount } = request;
		const validation = request.validate();
		// TODO return validation
		if (validation.length > 0) return false;

		return (
			await this.commandBus.execute(
				new RescueCommand(amount, HederaId.from(tokenId)),
			)
		).payload;
	}

	async wipe(request: WipeRequest): Promise<boolean> {
		const { tokenId, amount, targetId } = request;
		const validation = request.validate();
		// TODO return validation
		if (validation.length > 0) return false;

		return (
			await this.commandBus.execute(
				new WipeCommand(
					amount,
					HederaId.from(targetId),
					HederaId.from(tokenId),
				),
			)
		).payload;
	}

	async associate(request: AssociateTokenRequest): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	async getBalanceOf(request: GetAccountBalanceRequest): Promise<Balance> {
		const validation = request.validate();
		// TODO return validation
		if (validation.length > 0) throw new Error('validation error');

		const res = await this.commandBus.execute(
			new BalanceOfCommand(
				HederaId.from(request.targetId),
				HederaId.from(request.tokenId),
			),
		);

		return { value: res.payload };
	}

	async capabilities(
		request: CapabilitiesRequest,
	): Promise<StableCoinCapabilities> {
		const validation = request.validate();
		// TODO return validation
		if (validation.length > 0) throw new Error('validation error');

		return this.stableCoinService.getCapabilities(
			new Account({ id: request.account.accountId }),
			HederaId.from(request.tokenId),
		);
	}

	async pause(request: PauseRequest): Promise<boolean> {
		const { tokenId } = request;
		const validation = request.validate();
		// TODO return validation
		if (validation.length > 0) return false;

		return (
			await this.commandBus.execute(
				new PauseCommand(HederaId.from(tokenId)),
			)
		).payload;
	}

	async unPause(request: PauseRequest): Promise<boolean> {
		const { tokenId } = request;
		const validation = request.validate();
		// TODO return validation
		if (validation.length > 0) return false;

		return (
			await this.commandBus.execute(
				new UnPauseCommand(HederaId.from(tokenId)),
			)
		).payload;
	}

	async delete(request: DeleteRequest): Promise<boolean> {
		const { tokenId } = request;
		const validation = request.validate();
		// TODO return validation
		if (validation.length > 0) return false;

		return (
			await this.commandBus.execute(
				new DeleteCommand(HederaId.from(tokenId)),
			)
		).payload;
	}

	async freeze(request: FreezeAccountRequest): Promise<boolean> {
		const { tokenId, targetId } = request;
		const validation = request.validate();
		// TODO return validation
		if (validation.length > 0) return false;

		return (
			await this.commandBus.execute(
				new FreezeCommand(
					HederaId.from(targetId),
					HederaId.from(tokenId),
				),
			)
		).payload;
	}

	async unFreeze(request: FreezeAccountRequest): Promise<boolean> {
		const { tokenId, targetId } = request;
		const validation = request.validate();
		// TODO return validation
		if (validation.length > 0) return false;

		return (
			await this.commandBus.execute(
				new UnFreezeCommand(
					HederaId.from(targetId),
					HederaId.from(tokenId),
				),
			)
		).payload;
	}
}

const StableCoin = new StableCoinInPort();
export default StableCoin;
