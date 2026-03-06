/*
 *
 * Hedera Stablecoin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import Injectable from '../../core/Injectable.js';
import CreateRequest from './request/CreateRequest.js';
import CashInRequest from './request/CashInRequest.js';
import GetStableCoinDetailsRequest from './request/GetStableCoinDetailsRequest.js';
import BurnRequest from './request/BurnRequest.js';
import RescueRequest from './request/RescueRequest.js';
import RescueHBARRequest from './request/RescueHBARRequest.js';
import WipeRequest from './request/WipeRequest.js';
import AssociateTokenRequest from './request/AssociateTokenRequest.js';
import BigDecimal from '../../domain/context/shared/BigDecimal.js';
import { HederaId } from '../../domain/context/shared/HederaId.js';
import ContractId from '../../domain/context/contract/ContractId.js';
import EvmAddress from '../../domain/context/contract/EvmAddress.js';
import {
	StableCoinProps,
	TRANSFER_LIST_SIZE,
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
import GetAccountBalanceHBARRequest from './request/GetAccountBalanceHBARRequest.js';
import CapabilitiesRequest from './request/CapabilitiesRequest.js';
import IsAccountAssociatedTokenRequest from './request/IsAccountAssociatedTokenRequest.js';
import { Balance } from '../../domain/context/stablecoin/Balance.js';
import StableCoinCapabilities from '../../domain/context/stablecoin/StableCoinCapabilities.js';
import {
	Access,
	Capability,
	Operation,
} from '../../domain/context/stablecoin/Capability.js';
import { TokenSupplyType } from '../../domain/context/stablecoin/TokenSupply.js';
import Account from '../../domain/context/account/Account.js';
import { TransactionResult } from '../../domain/context/transaction/TransactionResult.js';
import { BurnCommand } from '../../app/usecase/command/stablecoin/operations/burn/BurnCommand.js';
import { RescueCommand } from '../../app/usecase/command/stablecoin/operations/rescue/RescueCommand.js';
import { RescueHBARCommand } from '../../app/usecase/command/stablecoin/operations/rescueHBAR/RescueHBARCommand.js';
import { WipeCommand } from '../../app/usecase/command/stablecoin/operations/wipe/WipeCommand.js';
import { PauseCommand } from '../../app/usecase/command/stablecoin/operations/pause/PauseCommand.js';
import { UnPauseCommand } from '../../app/usecase/command/stablecoin/operations/unpause/UnPauseCommand.js';
import { DeleteCommand } from '../../app/usecase/command/stablecoin/operations/delete/DeleteCommand.js';
import { FreezeCommand } from '../../app/usecase/command/stablecoin/operations/freeze/FreezeCommand.js';
import { UnFreezeCommand } from '../../app/usecase/command/stablecoin/operations/unfreeze/UnFreezeCommand.js';
import { GetAccountInfoQuery } from '../../app/usecase/query/account/info/GetAccountInfoQuery.js';
import { handleValidation } from './Common.js';
import UpdateReserveAddressRequest from './request/UpdateReserveAddressRequest.js';
import GetReserveAddressRequest from './request/GetReserveAddressRequest.js';
import { UpdateReserveAddressCommand } from '../../app/usecase/command/stablecoin/operations/updateReserveAddress/UpdateReserveAddressCommand.js';
import { RESERVE_DECIMALS } from '../../domain/context/reserve/Reserve.js';
import ReserveViewModel from '../out/mirror/response/ReserveViewModel.js';
import { BalanceOfQuery } from '../../app/usecase/query/stablecoin/balanceof/BalanceOfQuery.js';
import { BalanceOfHBARQuery } from '../../app/usecase/query/stablecoin/balanceOfHBAR/BalanceOfHBARQuery.js';
import { GetReserveAddressQuery } from '../../app/usecase/query/stablecoin/getReserveAddress/GetReserveAddressQuey.js';
import KYCRequest from './request/KYCRequest.js';
import { GrantKycCommand } from '../../app/usecase/command/stablecoin/operations/grantKyc/GrantKycCommand.js';
import { RevokeKycCommand } from '../../app/usecase/command/stablecoin/operations/revokeKyc/RevokeKycCommand.js';
import { LogError } from '../../core/decorator/LogErrorDecorator.js';
import { GetAccountTokenRelationshipQuery } from '../../app/usecase/query/account/tokenRelationship/GetAccountTokenRelationshipQuery.js';
import {
	FreezeStatus,
	KycStatus,
} from '../out/mirror/response/AccountTokenRelationViewModel.js';
import TransfersRequest from './request/TransfersRequest.js';
import UpdateRequest from './request/UpdateRequest.js';
import { TransfersCommand } from '../../app/usecase/command/stablecoin/operations/transfer/TransfersCommand.js';
import { UpdateCommand } from '../../app/usecase/command/stablecoin/update/UpdateCommand.js';
import NetworkService from '../../app/service/NetworkService.js';
import { AssociateCommand } from '../../app/usecase/command/account/associate/AssociateCommand.js';
import { MirrorNodeAdapter } from '../../port/out/mirror/MirrorNodeAdapter.js';
import MultiSigTransactionViewModel from '../out/backend/response/MultiSigTransactionViewModel';
import MultiSigTransactionsViewModel from '../out/backend/response/MultiSigTransactionsViewModel';
import { PaginationViewModel } from '../out/backend/response/MultiSigTransactionsViewModel.js';
import SignTransactionRequest from './request/SignTransactionRequest.js';
import SubmitTransactionRequest from './request/SubmitTransactionRequest.js';
import RemoveTransactionRequest from './request/RemoveTransactionRequest.js';
import GetTransactionsRequest from './request/GetTransactionsRequest.js';
import { SignCommand } from '../../app/usecase/command/stablecoin/backend/sign/SignCommand.js';
import { RemoveCommand } from '../../app/usecase/command/stablecoin/backend/remove/RemoveCommand.js';
import { SubmitCommand } from '../../app/usecase/command/stablecoin/backend/submit/SubmitCommand.js';
import { GetTransactionsQuery } from '../../app/usecase/query/stablecoin/backend/getTransactions/GetTransactionsQuery.js';
import CreateHoldRequest from './request/CreateHoldRequest.js';
import CreateHoldByControllerRequest from './request/CreateHoldByControllerRequest.js';
import ExecuteHoldRequest from './request/ExecuteHoldRequest.js';
import ReleaseHoldRequest from './request/ReleaseHoldRequest.js';
import ReclaimHoldRequest from './request/ReclaimHoldRequest.js';
import GetHoldForRequest from './request/GetHoldForRequest.js';
import GetHeldAmountForRequest from './request/GetHeldAmountForRequest.js';
import GetHoldCountForRequest from './request/GetHoldCountForRequest.js';
import GetHoldsIdForRequest from './request/GetHoldsIdForRequest.js';
import { CreateHoldCommand, CreateHoldCommandResponse } from '../../app/usecase/command/stablecoin/operations/hold/createHold/CreateHoldCommand.js';
import { ExecuteHoldCommand, ExecuteHoldCommandResponse } from '../../app/usecase/command/stablecoin/operations/hold/executeHold/ExecuteHoldCommand.js';
import { ReleaseHoldCommand, ReleaseHoldCommandResponse } from '../../app/usecase/command/stablecoin/operations/hold/releaseHold/ReleaseHoldCommand.js';
import { ReclaimHoldCommand, ReclaimHoldCommandResponse } from '../../app/usecase/command/stablecoin/operations/hold/reclaimHold/ReclaimHoldCommand.js';
import { GetHoldForQuery } from '../../app/usecase/query/stablecoin/hold/getHoldFor/GetHoldForQuery.js';
import HoldViewModel from '../../port/in/response/HoldViewModel.js';
import { ONE_THOUSAND } from '../../core/Constants.js';
import { GetHoldCountForQuery } from '../../app/usecase/query/stablecoin/hold/getHoldCountFor/GetHoldCountForQuery.js';
import { GetHoldsIdForQuery } from '../../app/usecase/query/stablecoin/hold/getHoldsIdFor/GetHoldsIdForQuery.js';
import { GetHeldAmountForQuery } from '../../app/usecase/query/stablecoin/hold/getHeldAmountFor/GetHeldAmountForQuery.js';
import { CreateHoldByControllerCommand, CreateHoldByControllerCommandResponse } from '../../app/usecase/command/stablecoin/operations/hold/createHoldByController/CreateHoldByControllerCommand.js';
import { SerializedTransactionData } from '../../domain/context/transaction/TransactionResponse.js';


export {
	StableCoinViewModel,
	StableCoinListViewModel,
	ReserveViewModel,
	MultiSigTransactionsViewModel,
	MultiSigTransactionViewModel,
	PaginationViewModel,
	TRANSFER_LIST_SIZE,
};
export { StableCoinCapabilities, Capability, Access, Operation, Balance };
export { TokenSupplyType };
export { BigDecimal, HederaId, ContractId, EvmAddress, PublicKey };

export type CreateHoldTransactionResult = { holdId: number } & TransactionResult;

interface IStableCoinInPort {
	create(request: CreateRequest): Promise<{
		coin: StableCoinViewModel;
		reserve: ReserveViewModel;
	}>;
	buildCreate(request: CreateRequest): Promise<SerializedTransactionData>;
	getInfo(request: GetStableCoinDetailsRequest): Promise<StableCoinViewModel>;
	cashIn(request: CashInRequest): Promise<TransactionResult>;
	buildCashIn(request: CashInRequest): Promise<SerializedTransactionData>;
	burn(request: BurnRequest): Promise<TransactionResult>;
	buildBurn(request: BurnRequest): Promise<SerializedTransactionData>;
	rescue(request: RescueRequest): Promise<TransactionResult>;
	buildRescue(request: RescueRequest): Promise<SerializedTransactionData>;
	rescueHBAR(request: RescueHBARRequest): Promise<TransactionResult>;
	buildRescueHBAR(request: RescueHBARRequest): Promise<SerializedTransactionData>;
	wipe(request: WipeRequest): Promise<TransactionResult>;
	buildWipe(request: WipeRequest): Promise<SerializedTransactionData>;
	associate(request: AssociateTokenRequest): Promise<TransactionResult>;
	buildAssociate(request: AssociateTokenRequest): Promise<SerializedTransactionData>;
	getBalanceOf(request: GetAccountBalanceRequest): Promise<Balance>;
	getBalanceOfHBAR(request: GetAccountBalanceHBARRequest): Promise<Balance>;
	capabilities(request: CapabilitiesRequest): Promise<StableCoinCapabilities>;
	pause(request: PauseRequest): Promise<TransactionResult>;
	buildPause(request: PauseRequest): Promise<SerializedTransactionData>;
	unPause(request: PauseRequest): Promise<TransactionResult>;
	buildUnPause(request: PauseRequest): Promise<SerializedTransactionData>;
	delete(request: DeleteRequest): Promise<TransactionResult>;
	buildDelete(request: DeleteRequest): Promise<SerializedTransactionData>;
	freeze(request: FreezeAccountRequest): Promise<TransactionResult>;
	buildFreeze(request: FreezeAccountRequest): Promise<SerializedTransactionData>;
	unFreeze(request: FreezeAccountRequest): Promise<TransactionResult>;
	buildUnFreeze(request: FreezeAccountRequest): Promise<SerializedTransactionData>;
	isAccountFrozen(request: FreezeAccountRequest): Promise<boolean>;
	isAccountAssociated(
		request: IsAccountAssociatedTokenRequest,
	): Promise<boolean>;
	getReserveAddress(request: GetReserveAddressRequest): Promise<string>;
	updateReserveAddress(
		request: UpdateReserveAddressRequest,
	): Promise<TransactionResult>;
	buildUpdateReserveAddress(
		request: UpdateReserveAddressRequest,
	): Promise<SerializedTransactionData>;
	grantKyc(request: KYCRequest): Promise<TransactionResult>;
	buildGrantKyc(request: KYCRequest): Promise<SerializedTransactionData>;
	revokeKyc(request: KYCRequest): Promise<TransactionResult>;
	buildRevokeKyc(request: KYCRequest): Promise<SerializedTransactionData>;
	isAccountKYCGranted(request: KYCRequest): Promise<boolean>;
	createHold(request: CreateHoldRequest): Promise<CreateHoldTransactionResult>;
	buildCreateHold(request: CreateHoldRequest): Promise<SerializedTransactionData>;
	createHoldByController(request: CreateHoldByControllerRequest): Promise<CreateHoldTransactionResult>;
	buildCreateHoldByController(request: CreateHoldByControllerRequest): Promise<SerializedTransactionData>;
	executeHold(request: ExecuteHoldRequest): Promise<TransactionResult>;
	buildExecuteHold(request: ExecuteHoldRequest): Promise<SerializedTransactionData>;
	releaseHold(request: ReleaseHoldRequest): Promise<TransactionResult>;
	buildReleaseHold(request: ReleaseHoldRequest): Promise<SerializedTransactionData>;
	reclaimHold(request: ReclaimHoldRequest): Promise<TransactionResult>;
	buildReclaimHold(request: ReclaimHoldRequest): Promise<SerializedTransactionData>;
	getHoldFor(request: GetHoldForRequest): Promise<HoldViewModel>;
	getHeldAmountFor(request: GetHeldAmountForRequest): Promise<BigDecimal>;
	getHoldCountFor(request: GetHoldCountForRequest): Promise<number>;
	getHoldsIdFor(request: GetHoldsIdForRequest): Promise<number[]>;
	transfers(request: TransfersRequest): Promise<TransactionResult>;
	buildTransfers(request: TransfersRequest): Promise<SerializedTransactionData>;
	update(request: UpdateRequest): Promise<TransactionResult>;
	buildUpdate(request: UpdateRequest): Promise<SerializedTransactionData>;
	signTransaction(request: SignTransactionRequest): Promise<TransactionResult>;
	submitTransaction(request: SubmitTransactionRequest): Promise<TransactionResult>;
	removeTransaction(request: RemoveTransactionRequest): Promise<TransactionResult>;
	getTransactions(
		request: GetTransactionsRequest,
	): Promise<MultiSigTransactionsViewModel>;
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
		private readonly networkService: NetworkService = Injectable.resolve(
			NetworkService,
		),
		private readonly mirrorNode: MirrorNodeAdapter = Injectable.resolve(
			MirrorNodeAdapter,
		),
	) {}

	private async _executeCreateCommand(req: CreateRequest) {
		const {
			reserveAddress,
			updatedAtThreshold,
			reserveInitialAmount,
			createReserve,
			proxyOwnerAccount,
			configId,
			configVersion,
			reserveConfigVersion,
			reserveConfigId,
		} = req;

		const stableCoinFactory =
			this.networkService.configuration.factoryAddress;
		const resolver = this.networkService.configuration.resolverAddress;

		const coin: StableCoinProps = {
			name: req.name,
			symbol: req.symbol,
			decimals: req.decimals,
			adminKey: PublicKey.NULL,
			initialSupply: BigDecimal.fromString(
				req.initialSupply ?? '0',
				req.decimals,
			),
			maxSupply: req.maxSupply
				? BigDecimal.fromString(req.maxSupply, req.decimals)
				: undefined,
			freezeKey: req.freezeKey
				? new PublicKey({
						key: req.freezeKey.key,
						type: req.freezeKey.type,
				  })
				: undefined,
			freezeDefault: req.freezeDefault,
			wipeKey: req.wipeKey
				? new PublicKey({
						key: req.wipeKey.key,
						type: req.wipeKey.type,
				  })
				: undefined,
			kycKey: req.kycKey
				? new PublicKey({
						key: req.kycKey.key,
						type: req.kycKey.type,
				  })
				: undefined,
			pauseKey: req.pauseKey
				? new PublicKey({
						key: req.pauseKey.key,
						type: req.pauseKey.type,
				  })
				: undefined,
			supplyKey: PublicKey.NULL,
			feeScheduleKey: req.feeScheduleKey
				? new PublicKey({
						key: req.feeScheduleKey.key,
						type: req.feeScheduleKey.type,
				  })
				: undefined,
			treasury: undefined,
			supplyType: req.supplyType,
			autoRenewAccount: undefined,
			burnRoleAccount: new HederaId(req.burnRoleAccount ?? '0.0.0'),
			wipeRoleAccount: new HederaId(req.wipeRoleAccount ?? '0.0.0'),
			rescueRoleAccount: new HederaId(req.rescueRoleAccount ?? '0.0.0'),
			pauseRoleAccount: new HederaId(req.pauseRoleAccount ?? '0.0.0'),
			freezeRoleAccount: new HederaId(req.freezeRoleAccount ?? '0.0.0'),
			deleteRoleAccount: new HederaId(req.deleteRoleAccount ?? '0.0.0'),
			kycRoleAccount: new HederaId(req.kycRoleAccount ?? '0.0.0'),
			cashInRoleAccount: new HederaId(req.cashInRoleAccount ?? '0.0.0'),
			feeRoleAccount: new HederaId(req.feeRoleAccount ?? '0.0.0'),
			holdCreatorRoleAccount: new HederaId(
				req.holdCreatorRoleAccount ?? '0.0.0',
			),
			cashInRoleAllowance: BigDecimal.fromString(
				req.cashInRoleAllowance ?? '0',
				req.decimals,
			),
			metadata: req.metadata,
		};

		const stableCoinFactoryId: string | undefined = (
			await this.mirrorNode.getContractInfo(stableCoinFactory)
		).id;

		const reserveAddressId: string | undefined = reserveAddress
			? (await this.mirrorNode.getContractInfo(reserveAddress)).id
			: undefined;

		return await this.commandBus.execute(
			new CreateCommand(
				coin,
				createReserve,
				stableCoinFactoryId
					? new ContractId(stableCoinFactoryId)
					: undefined,
				reserveAddressId ? new ContractId(reserveAddressId) : undefined,
				updatedAtThreshold,
				reserveInitialAmount
					? BigDecimal.fromString(
							reserveInitialAmount,
							RESERVE_DECIMALS,
					  )
					: undefined,
				proxyOwnerAccount ? new HederaId(proxyOwnerAccount) : undefined,
				resolver ? new ContractId(resolver) : undefined,
				configId,
				configVersion,
				reserveConfigVersion,
				reserveConfigId,
			),
		);
	}

	@LogError
	async create(req: CreateRequest): Promise<{
		coin: StableCoinViewModel;
		reserve: ReserveViewModel;
	}> {
		handleValidation('CreateRequest', req);
		const createResponse = await this._executeCreateCommand(req);
		return {
			coin:
				createResponse.tokenId.toString() !== ContractId.NULL.toString()
					? (
							await this.queryBus.execute(
								new GetStableCoinQuery(createResponse.tokenId),
							)
					  ).coin
					: {},
			reserve: {
				proxyAddress: createResponse.reserveProxy,
			},
		};
	}

	@LogError
	async buildCreate(req: CreateRequest): Promise<SerializedTransactionData> {
		handleValidation('CreateRequest', req);
		return (await this._executeCreateCommand(req)).serializedTransactionData!;
	}

	@LogError
	async getInfo(
		request: GetStableCoinDetailsRequest,
	): Promise<StableCoinViewModel> {
		const { id } = request;
		handleValidation('GetStableCoinDetailsRequest', request);
		const coin = (
			await this.queryBus.execute(
				new GetStableCoinQuery(HederaId.from(id)),
			)
		).coin;
		return coin;
	}

	@LogError
	async cashIn(request: CashInRequest): Promise<TransactionResult> {
		const { tokenId, amount, targetId, startDate } = request;
		handleValidation('CashInRequest', request);

		const response = await this.commandBus.execute(
			new CashInCommand(
				amount,
				HederaId.from(targetId),
				HederaId.from(tokenId),
				startDate,
			),
		);
		return new TransactionResult(response.payload, response.transactionId);
	}

	@LogError
	async buildCashIn(request: CashInRequest): Promise<SerializedTransactionData> {
		const { tokenId, amount, targetId, startDate } = request;
		handleValidation('CashInRequest', request);

		const response = await this.commandBus.execute(
			new CashInCommand(
				amount,
				HederaId.from(targetId),
				HederaId.from(tokenId),
				startDate,
			),
		);
		return response.serializedTransactionData!;
	}

	@LogError
	async burn(request: BurnRequest): Promise<TransactionResult> {
		const { tokenId, amount, startDate } = request;
		handleValidation('BurnRequest', request);

		const response = await this.commandBus.execute(
			new BurnCommand(amount, HederaId.from(tokenId), startDate),
		);
		return new TransactionResult(response.payload, response.transactionId);
	}

	@LogError
	async buildBurn(request: BurnRequest): Promise<SerializedTransactionData> {
		const { tokenId, amount, startDate } = request;
		handleValidation('BurnRequest', request);

		const response = await this.commandBus.execute(
			new BurnCommand(amount, HederaId.from(tokenId), startDate),
		);
		return response.serializedTransactionData!;
	}

	@LogError
	async rescue(request: RescueRequest): Promise<TransactionResult> {
		const { tokenId, amount, startDate } = request;
		handleValidation('RescueRequest', request);

		const response = await this.commandBus.execute(
			new RescueCommand(amount, HederaId.from(tokenId), startDate),
		);
		return new TransactionResult(response.payload, response.transactionId);
	}

	@LogError
	async buildRescue(request: RescueRequest): Promise<SerializedTransactionData> {
		const { tokenId, amount, startDate } = request;
		handleValidation('RescueRequest', request);

		const response = await this.commandBus.execute(
			new RescueCommand(amount, HederaId.from(tokenId), startDate),
		);
		return response.serializedTransactionData!;
	}

	@LogError
	async rescueHBAR(request: RescueHBARRequest): Promise<TransactionResult> {
		const { tokenId, amount, startDate } = request;
		handleValidation('RescueHBARRequest', request);

		const response = await this.commandBus.execute(
			new RescueHBARCommand(
				amount,
				HederaId.from(tokenId),
				startDate,
			),
		);
		return new TransactionResult(response.payload, response.transactionId);
	}

	@LogError
	async buildRescueHBAR(request: RescueHBARRequest): Promise<SerializedTransactionData> {
		const { tokenId, amount, startDate } = request;
		handleValidation('RescueHBARRequest', request);

		const response = await this.commandBus.execute(
			new RescueHBARCommand(
				amount,
				HederaId.from(tokenId),
				startDate,
			),
		);
		return response.serializedTransactionData!;
	}

	@LogError
	async wipe(request: WipeRequest): Promise<TransactionResult> {
		const { tokenId, amount, targetId, startDate } = request;
		handleValidation('WipeRequest', request);

		const response = await this.commandBus.execute(
			new WipeCommand(
				amount,
				HederaId.from(targetId),
				HederaId.from(tokenId),
				startDate,
			),
		);
		return new TransactionResult(response.payload, response.transactionId);
	}

	@LogError
	async buildWipe(request: WipeRequest): Promise<SerializedTransactionData> {
		const { tokenId, amount, targetId, startDate } = request;
		handleValidation('WipeRequest', request);

		const response = await this.commandBus.execute(
			new WipeCommand(
				amount,
				HederaId.from(targetId),
				HederaId.from(tokenId),
				startDate,
			),
		);
		return response.serializedTransactionData!;
	}

	@LogError
	async associate(request: AssociateTokenRequest): Promise<TransactionResult> {
		const { tokenId, targetId } = request;
		handleValidation('AssociateTokenRequest', request);

		const response = await this.commandBus.execute(
			new AssociateCommand(
				HederaId.from(targetId),
				HederaId.from(tokenId),
			),
		);
		return new TransactionResult(response.payload, response.transactionId);
	}

	@LogError
	async buildAssociate(request: AssociateTokenRequest): Promise<SerializedTransactionData> {
		const { tokenId, targetId } = request;
		handleValidation('AssociateTokenRequest', request);

		const response = await this.commandBus.execute(
			new AssociateCommand(
				HederaId.from(targetId),
				HederaId.from(tokenId),
			),
		);
		return response.serializedTransactionData!;
	}

	@LogError
	async getBalanceOf(request: GetAccountBalanceRequest): Promise<Balance> {
		handleValidation('GetAccountBalanceRequest', request);

		const res = await this.queryBus.execute(
			new BalanceOfQuery(
				HederaId.from(request.tokenId),
				HederaId.from(request.targetId),
			),
		);

		return new Balance(res.payload);
	}

	@LogError
	async getBalanceOfHBAR(
		request: GetAccountBalanceHBARRequest,
	): Promise<Balance> {
		handleValidation('GetAccountBalanceHBARRequest', request);

		const res = await this.queryBus.execute(
			new BalanceOfHBARQuery(HederaId.from(request.treasuryAccountId)),
		);

		return new Balance(res.payload);
	}

	@LogError
	async capabilities(
		request: CapabilitiesRequest,
	): Promise<StableCoinCapabilities> {
		handleValidation('CapabilitiesRequest', request);

		const resp = await this.queryBus.execute(
			new GetAccountInfoQuery(HederaId.from(request.account.accountId)),
		);
		return this.stableCoinService.getCapabilities(
			new Account({
				id: resp.account.id ?? request.account.accountId,
				publicKey: resp.account.publicKey,
			}),
			HederaId.from(request.tokenId),
			request.tokenIsPaused,
			request.tokenIsDeleted,
		);
	}

	@LogError
	async pause(request: PauseRequest): Promise<TransactionResult> {
		const { tokenId, startDate } = request;
		handleValidation('PauseRequest', request);

		const response = await this.commandBus.execute(
			new PauseCommand(HederaId.from(tokenId), startDate),
		);
		return new TransactionResult(response.payload, response.transactionId);
	}

	@LogError
	async buildPause(request: PauseRequest): Promise<SerializedTransactionData> {
		const { tokenId, startDate } = request;
		handleValidation('PauseRequest', request);

		const response = await this.commandBus.execute(
			new PauseCommand(HederaId.from(tokenId), startDate),
		);
		return response.serializedTransactionData!;
	}

	@LogError
	async unPause(request: PauseRequest): Promise<TransactionResult> {
		const { tokenId, startDate } = request;
		handleValidation('PauseRequest', request);

		const response = await this.commandBus.execute(
			new UnPauseCommand(HederaId.from(tokenId), startDate),
		);
		return new TransactionResult(response.payload, response.transactionId);
	}

	@LogError
	async buildUnPause(request: PauseRequest): Promise<SerializedTransactionData> {
		const { tokenId, startDate } = request;
		handleValidation('PauseRequest', request);

		const response = await this.commandBus.execute(
			new UnPauseCommand(HederaId.from(tokenId), startDate),
		);
		return response.serializedTransactionData!;
	}

	@LogError
	async delete(request: DeleteRequest): Promise<TransactionResult> {
		const { tokenId, startDate } = request;
		handleValidation('DeleteRequest', request);

		const response = await this.commandBus.execute(
			new DeleteCommand(HederaId.from(tokenId), startDate),
		);
		return new TransactionResult(response.payload, response.transactionId);
	}

	@LogError
	async buildDelete(request: DeleteRequest): Promise<SerializedTransactionData> {
		const { tokenId, startDate } = request;
		handleValidation('DeleteRequest', request);

		const response = await this.commandBus.execute(
			new DeleteCommand(HederaId.from(tokenId), startDate),
		);
		return response.serializedTransactionData!;
	}

	@LogError
	async freeze(request: FreezeAccountRequest): Promise<TransactionResult> {
		const { tokenId, targetId, startDate } = request;
		handleValidation('FreezeAccountRequest', request);

		const response = await this.commandBus.execute(
			new FreezeCommand(
				HederaId.from(targetId),
				HederaId.from(tokenId),
				startDate,
			),
		);
		return new TransactionResult(response.payload, response.transactionId);
	}

	@LogError
	async buildFreeze(request: FreezeAccountRequest): Promise<SerializedTransactionData> {
		const { tokenId, targetId, startDate } = request;
		handleValidation('FreezeAccountRequest', request);

		const response = await this.commandBus.execute(
			new FreezeCommand(
				HederaId.from(targetId),
				HederaId.from(tokenId),
				startDate,
			),
		);
		return response.serializedTransactionData!;
	}

	@LogError
	async unFreeze(request: FreezeAccountRequest): Promise<TransactionResult> {
		const { tokenId, targetId, startDate } = request;
		handleValidation('FreezeAccountRequest', request);

		const response = await this.commandBus.execute(
			new UnFreezeCommand(
				HederaId.from(targetId),
				HederaId.from(tokenId),
				startDate,
			),
		);
		return new TransactionResult(response.payload, response.transactionId);
	}

	@LogError
	async buildUnFreeze(request: FreezeAccountRequest): Promise<SerializedTransactionData> {
		const { tokenId, targetId, startDate } = request;
		handleValidation('FreezeAccountRequest', request);

		const response = await this.commandBus.execute(
			new UnFreezeCommand(
				HederaId.from(targetId),
				HederaId.from(tokenId),
				startDate,
			),
		);
		return response.serializedTransactionData!;
	}

	@LogError
	async isAccountFrozen(request: FreezeAccountRequest): Promise<boolean> {
		const { tokenId, targetId } = request;
		handleValidation('FreezeAccountRequest', request);

		return (
			(
				await this.queryBus.execute(
					new GetAccountTokenRelationshipQuery(
						HederaId.from(targetId),
						HederaId.from(tokenId),
					),
				)
			).payload?.freezeStatus === FreezeStatus.FROZEN
		);
	}

	@LogError
	async grantKyc(request: KYCRequest): Promise<TransactionResult> {
		const { tokenId, targetId } = request;
		handleValidation('KYCRequest', request);

		const response = await this.commandBus.execute(
			new GrantKycCommand(
				HederaId.from(targetId),
				HederaId.from(tokenId),
			),
		);
		return new TransactionResult(response.payload, response.transactionId);
	}

	@LogError
	async buildGrantKyc(request: KYCRequest): Promise<SerializedTransactionData> {
		const { tokenId, targetId } = request;
		handleValidation('KYCRequest', request);

		const response = await this.commandBus.execute(
			new GrantKycCommand(
				HederaId.from(targetId),
				HederaId.from(tokenId),
			),
		);
		return response.serializedTransactionData!;
	}

	@LogError
	async revokeKyc(request: KYCRequest): Promise<TransactionResult> {
		const { tokenId, targetId } = request;
		handleValidation('KYCRequest', request);

		const response = await this.commandBus.execute(
			new RevokeKycCommand(
				HederaId.from(targetId),
				HederaId.from(tokenId),
			),
		);
		return new TransactionResult(response.payload, response.transactionId);
	}

	@LogError
	async buildRevokeKyc(request: KYCRequest): Promise<SerializedTransactionData> {
		const { tokenId, targetId } = request;
		handleValidation('KYCRequest', request);

		const response = await this.commandBus.execute(
			new RevokeKycCommand(
				HederaId.from(targetId),
				HederaId.from(tokenId),
			),
		);
		return response.serializedTransactionData!;
	}

	@LogError
	async isAccountKYCGranted(request: KYCRequest): Promise<boolean> {
		const { tokenId, targetId } = request;
		handleValidation('KYCRequest', request);

		return (
			(
				await this.queryBus.execute(
					new GetAccountTokenRelationshipQuery(
						HederaId.from(targetId),
						HederaId.from(tokenId),
					),
				)
			).payload?.kycStatus === KycStatus.GRANTED
		);
	}

	@LogError
	async isAccountAssociated(
		request: IsAccountAssociatedTokenRequest,
	): Promise<boolean> {
		handleValidation('IsAccountAssociatedTokenRequest', request);

		return (
			(
				await this.queryBus.execute(
					new GetAccountTokenRelationshipQuery(
						HederaId.from(request.targetId),
						HederaId.from(request.tokenId),
					),
				)
			).payload !== undefined
		);
	}

	@LogError
	async getReserveAddress(
		request: GetReserveAddressRequest,
	): Promise<string> {
		handleValidation('GetReserveAddressRequest', request);

		return (
			await this.queryBus.execute(
				new GetReserveAddressQuery(HederaId.from(request.tokenId)),
			)
		).payload.toString();
	}

	@LogError
	async updateReserveAddress(
		request: UpdateReserveAddressRequest,
	): Promise<TransactionResult> {
		handleValidation('UpdateReserveAddressRequest', request);

		// Handle special case: '0.0.0' (zero address) - don't query mirror node
		let reserveAddressId: string;
		if (request.reserveAddress === '0.0.0') {
			reserveAddressId = '0.0.0';
		} else {
			reserveAddressId = (
				await this.mirrorNode.getContractInfo(request.reserveAddress)
			).id;
		}

		const response = await this.commandBus.execute(
			new UpdateReserveAddressCommand(
				HederaId.from(request.tokenId),
				new ContractId(reserveAddressId),
			),
		);
		return new TransactionResult(response.payload, response.transactionId);
	}

	@LogError
	async buildUpdateReserveAddress(
		request: UpdateReserveAddressRequest,
	): Promise<SerializedTransactionData> {
		handleValidation('UpdateReserveAddressRequest', request);

		let reserveAddressId: string;
		if (request.reserveAddress === '0.0.0') {
			reserveAddressId = '0.0.0';
		} else {
			reserveAddressId = (
				await this.mirrorNode.getContractInfo(request.reserveAddress)
			).id;
		}

		const response = await this.commandBus.execute(
			new UpdateReserveAddressCommand(
				HederaId.from(request.tokenId),
				new ContractId(reserveAddressId),
			),
		);
		return response.serializedTransactionData!;
	}

	@LogError
	async createHold(
		request: CreateHoldRequest,
	): Promise<CreateHoldTransactionResult> {
		handleValidation(CreateHoldRequest.name, request);
		const { tokenId, targetId, amount, expirationDate, escrow } = request;
		const response = await this.commandBus.execute(
			new CreateHoldCommand(
				HederaId.from(tokenId),
				amount,
				HederaId.from(escrow),
				expirationDate,
				targetId ? HederaId.from(targetId) : undefined,
			),
		);
		return {
			holdId: response.holdId,
			success: response.payload,
			transactionId: response.transactionId,
		} as CreateHoldTransactionResult;
	}

	@LogError
	async buildCreateHold(
		request: CreateHoldRequest,
	): Promise<SerializedTransactionData> {
		handleValidation(CreateHoldRequest.name, request);
		const { tokenId, targetId, amount, expirationDate, escrow } = request;
		const response = await this.commandBus.execute(
			new CreateHoldCommand(
				HederaId.from(tokenId),
				amount,
				HederaId.from(escrow),
				expirationDate,
				targetId ? HederaId.from(targetId) : undefined,
			),
		);
		return response.serializedTransactionData!;
	}

	@LogError
	async createHoldByController(
		request: CreateHoldByControllerRequest,
	): Promise<CreateHoldTransactionResult> {
		handleValidation(CreateHoldByControllerRequest.name, request);
		const { tokenId, targetId, sourceId, amount, expirationDate, escrow } =
			request;
		const response = await this.commandBus.execute(
			new CreateHoldByControllerCommand(
				HederaId.from(tokenId),
				HederaId.from(sourceId),
				amount,
				HederaId.from(escrow),
				expirationDate,
				targetId ? HederaId.from(targetId) : undefined,
			),
		);
		return {
			holdId: response.holdId,
			success: response.payload,
			transactionId: response.transactionId,
		} as CreateHoldTransactionResult;
	}

	@LogError
	async buildCreateHoldByController(
		request: CreateHoldByControllerRequest,
	): Promise<SerializedTransactionData> {
		handleValidation(CreateHoldByControllerRequest.name, request);
		const { tokenId, targetId, sourceId, amount, expirationDate, escrow } =
			request;
		const response = await this.commandBus.execute(
			new CreateHoldByControllerCommand(
				HederaId.from(tokenId),
				HederaId.from(sourceId),
				amount,
				HederaId.from(escrow),
				expirationDate,
				targetId ? HederaId.from(targetId) : undefined,
			),
		);
		return response.serializedTransactionData!;
	}

	@LogError
	async executeHold(request: ExecuteHoldRequest): Promise<TransactionResult> {
		handleValidation(ExecuteHoldRequest.name, request);
		const { tokenId, targetId, amount, sourceId, holdId } = request;
		const response = await this.commandBus.execute(
			new ExecuteHoldCommand(
				HederaId.from(tokenId),
				holdId,
				HederaId.from(sourceId),
				amount,
				targetId ? HederaId.from(targetId) : undefined,
			),
		);
		return new TransactionResult(response.payload, response.transactionId);
	}

	@LogError
	async buildExecuteHold(request: ExecuteHoldRequest): Promise<SerializedTransactionData> {
		handleValidation(ExecuteHoldRequest.name, request);
		const { tokenId, targetId, amount, sourceId, holdId } = request;
		const response = await this.commandBus.execute(
			new ExecuteHoldCommand(
				HederaId.from(tokenId),
				holdId,
				HederaId.from(sourceId),
				amount,
				targetId ? HederaId.from(targetId) : undefined,
			),
		);
		return response.serializedTransactionData!;
	}

	@LogError
	async releaseHold(request: ReleaseHoldRequest): Promise<TransactionResult> {
		handleValidation(ReleaseHoldRequest.name, request);
		const { tokenId, amount, sourceId, holdId } = request;
		const response = await this.commandBus.execute(
			new ReleaseHoldCommand(
				HederaId.from(tokenId),
				holdId,
				HederaId.from(sourceId),
				amount,
			),
		);
		return new TransactionResult(response.payload, response.transactionId);
	}

	@LogError
	async buildReleaseHold(request: ReleaseHoldRequest): Promise<SerializedTransactionData> {
		handleValidation(ReleaseHoldRequest.name, request);
		const { tokenId, amount, sourceId, holdId } = request;
		const response = await this.commandBus.execute(
			new ReleaseHoldCommand(
				HederaId.from(tokenId),
				holdId,
				HederaId.from(sourceId),
				amount,
			),
		);
		return response.serializedTransactionData!;
	}

	@LogError
	async reclaimHold(request: ReclaimHoldRequest): Promise<TransactionResult> {
		handleValidation(ReclaimHoldRequest.name, request);
		const { tokenId, sourceId, holdId } = request;
		const response = await this.commandBus.execute(
			new ReclaimHoldCommand(
				HederaId.from(tokenId),
				holdId,
				HederaId.from(sourceId),
			),
		);
		return new TransactionResult(response.payload, response.transactionId);
	}

	@LogError
	async buildReclaimHold(request: ReclaimHoldRequest): Promise<SerializedTransactionData> {
		handleValidation(ReclaimHoldRequest.name, request);
		const { tokenId, sourceId, holdId } = request;
		const response = await this.commandBus.execute(
			new ReclaimHoldCommand(
				HederaId.from(tokenId),
				holdId,
				HederaId.from(sourceId),
			),
		);
		return response.serializedTransactionData!;
	}

	@LogError
	async getHoldFor(request: GetHoldForRequest): Promise<HoldViewModel> {
		handleValidation(GetHoldForRequest.name, request);
		const { tokenId, sourceId, holdId } = request;
		const res = (
			await this.queryBus.execute(
				new GetHoldForQuery(
					HederaId.from(tokenId),
					HederaId.from(sourceId),
					holdId,
				),
			)
		).payload;

		const hold: HoldViewModel = {
			id: request.holdId,
			amount: res.amount.toString(),
			expirationDate: new Date(res.expirationTimeStamp * ONE_THOUSAND),
			tokenHolderAddress:
				await this.mirrorNode.accountEvmAddressToHederaId(
					res.tokenHolderAddress,
				),
			escrowAddress: await this.mirrorNode.accountEvmAddressToHederaId(
				res.escrowAddress,
			),
			destinationAddress:
				await this.mirrorNode.accountEvmAddressToHederaId(
					res.destinationAddress,
				),
			data: res.data,
		};

		return hold;
	}

	@LogError
	async getHoldCountFor(request: GetHoldCountForRequest): Promise<number> {
		handleValidation(GetHoldCountForRequest.name, request);
		const { tokenId, sourceId } = request;
		return (
			await this.queryBus.execute(
				new GetHoldCountForQuery(
					HederaId.from(tokenId),
					HederaId.from(sourceId),
				),
			)
		).payload;
	}

	@LogError
	async getHoldsIdFor(request: GetHoldsIdForRequest): Promise<number[]> {
		handleValidation(GetHoldsIdForRequest.name, request);
		const { tokenId, sourceId, start, end } = request;
		return (
			await this.queryBus.execute(
				new GetHoldsIdForQuery(
					HederaId.from(tokenId),
					HederaId.from(sourceId),
					start,
					end,
				),
			)
		).payload;
	}

	@LogError
	async getHeldAmountFor(
		request: GetHeldAmountForRequest,
	): Promise<BigDecimal> {
		handleValidation(GetHeldAmountForRequest.name, request);
		const { tokenId, sourceId } = request;
		return (
			await this.queryBus.execute(
				new GetHeldAmountForQuery(
					HederaId.from(tokenId),
					HederaId.from(sourceId),
				),
			)
		).payload;
	}

	@LogError
	async transfers(request: TransfersRequest): Promise<TransactionResult> {
		const { tokenId, targetsId, amounts, targetId } = request;

		handleValidation('TransfersRequest', request);

		const targetsIdHederaIds: HederaId[] = [];
		targetsId.forEach((targetId) => {
			targetsIdHederaIds.push(HederaId.from(targetId));
		});

		const response = await this.commandBus.execute(
			new TransfersCommand(
				amounts,
				targetsIdHederaIds,
				HederaId.from(tokenId),
				HederaId.from(targetId),
			),
		);
		return new TransactionResult(response.payload, response.transactionId);
	}

	@LogError
	async buildTransfers(request: TransfersRequest): Promise<SerializedTransactionData> {
		const { tokenId, targetsId, amounts, targetId } = request;

		handleValidation('TransfersRequest', request);

		const targetsIdHederaIds: HederaId[] = [];
		targetsId.forEach((targetId) => {
			targetsIdHederaIds.push(HederaId.from(targetId));
		});

		const response = await this.commandBus.execute(
			new TransfersCommand(
				amounts,
				targetsIdHederaIds,
				HederaId.from(tokenId),
				HederaId.from(targetId),
			),
		);
		return response.serializedTransactionData!;
	}

	@LogError
	async update(request: UpdateRequest): Promise<TransactionResult> {
		const {
			tokenId,
			name,
			symbol,
			autoRenewPeriod,
			expirationTimestamp,
			kycKey,
			freezeKey,
			feeScheduleKey,
			pauseKey,
			wipeKey,
			metadata,
		} = request;
		handleValidation('UpdateRequest', request);
		const response = await this.commandBus.execute(
			new UpdateCommand(
				HederaId.from(tokenId),
				name,
				symbol,
				autoRenewPeriod ? Number(autoRenewPeriod) : undefined,
				expirationTimestamp
					? Number(expirationTimestamp)
					: undefined,
				kycKey
					? new PublicKey({
							key: kycKey.key,
							type: kycKey.type,
					  })
					: undefined,
				freezeKey
					? new PublicKey({
							key: freezeKey.key,
							type: freezeKey.type,
					  })
					: undefined,
				feeScheduleKey
					? new PublicKey({
							key: feeScheduleKey.key,
							type: feeScheduleKey.type,
					  })
					: undefined,
				pauseKey
					? new PublicKey({
							key: pauseKey.key,
							type: pauseKey.type,
					  })
					: undefined,
				wipeKey
					? new PublicKey({
							key: wipeKey.key,
							type: wipeKey.type,
					  })
					: undefined,
				metadata,
			),
		);
		return new TransactionResult(response.payload, response.transactionId);
	}

	@LogError
	async buildUpdate(request: UpdateRequest): Promise<SerializedTransactionData> {
		const {
			tokenId,
			name,
			symbol,
			autoRenewPeriod,
			expirationTimestamp,
			kycKey,
			freezeKey,
			feeScheduleKey,
			pauseKey,
			wipeKey,
			metadata,
		} = request;
		handleValidation('UpdateRequest', request);
		const response = await this.commandBus.execute(
			new UpdateCommand(
				HederaId.from(tokenId),
				name,
				symbol,
				autoRenewPeriod ? Number(autoRenewPeriod) : undefined,
				expirationTimestamp
					? Number(expirationTimestamp)
					: undefined,
				kycKey
					? new PublicKey({
							key: kycKey.key,
							type: kycKey.type,
					  })
					: undefined,
				freezeKey
					? new PublicKey({
							key: freezeKey.key,
							type: freezeKey.type,
					  })
					: undefined,
				feeScheduleKey
					? new PublicKey({
							key: feeScheduleKey.key,
							type: feeScheduleKey.type,
					  })
					: undefined,
				pauseKey
					? new PublicKey({
							key: pauseKey.key,
							type: pauseKey.type,
					  })
					: undefined,
				wipeKey
					? new PublicKey({
							key: wipeKey.key,
							type: wipeKey.type,
					  })
					: undefined,
				metadata,
			),
		);
		return response.serializedTransactionData!;
	}

	@LogError
	async signTransaction(request: SignTransactionRequest): Promise<TransactionResult> {
		const { transactionId } = request;

		handleValidation('SignTransactionRequest', request);

		const response = await this.commandBus.execute(new SignCommand(transactionId));
		return new TransactionResult(response.payload, response.transactionId);
	}

	@LogError
	async submitTransaction(request: SubmitTransactionRequest): Promise<TransactionResult> {
		const { transactionId } = request;

		handleValidation('SubmitTransactionRequest', request);

		const response = await this.commandBus.execute(new SubmitCommand(transactionId));
		return new TransactionResult(response.payload, response.transactionId);
	}

	@LogError
	async removeTransaction(
		request: RemoveTransactionRequest,
	): Promise<TransactionResult> {
		const { transactionId } = request;

		handleValidation('RemoveTransactionRequest', request);

		const response = await this.commandBus.execute(new RemoveCommand(transactionId));
		return new TransactionResult(response.payload, response.transactionId);
	}

	@LogError
	async getTransactions(
		request: GetTransactionsRequest,
	): Promise<MultiSigTransactionsViewModel> {
		handleValidation('GetTransactionsRequest', request);

		return (
			await this.queryBus.execute(
				new GetTransactionsQuery(
					request.page,
					request.limit,
					request.publicKey ? request.publicKey.key : undefined,
					request.status,
					request.account,
				),
			)
		).payload;
	}
}

const StableCoin = new StableCoinInPort();
export default StableCoin;
