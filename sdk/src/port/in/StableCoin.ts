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

interface IStableCoinInPort {
	create(request: CreateRequest): Promise<{
		coin: StableCoinViewModel;
		reserve: ReserveViewModel;
	}>;
	getInfo(request: GetStableCoinDetailsRequest): Promise<StableCoinViewModel>;
	cashIn(request: CashInRequest): Promise<boolean>;
	burn(request: BurnRequest): Promise<boolean>;
	rescue(request: RescueRequest): Promise<boolean>;
	rescueHBAR(request: RescueHBARRequest): Promise<boolean>;
	wipe(request: WipeRequest): Promise<boolean>;
	associate(request: AssociateTokenRequest): Promise<boolean>;
	getBalanceOf(request: GetAccountBalanceRequest): Promise<Balance>;
	getBalanceOfHBAR(request: GetAccountBalanceHBARRequest): Promise<Balance>;
	capabilities(request: CapabilitiesRequest): Promise<StableCoinCapabilities>;
	pause(request: PauseRequest): Promise<boolean>;
	unPause(request: PauseRequest): Promise<boolean>;
	delete(request: DeleteRequest): Promise<boolean>;
	freeze(request: FreezeAccountRequest): Promise<boolean>;
	unFreeze(request: FreezeAccountRequest): Promise<boolean>;
	isAccountFrozen(request: FreezeAccountRequest): Promise<boolean>;
	isAccountAssociated(
		request: IsAccountAssociatedTokenRequest,
	): Promise<boolean>;
	getReserveAddress(request: GetReserveAddressRequest): Promise<string>;
	updateReserveAddress(
		request: UpdateReserveAddressRequest,
	): Promise<boolean>;
	grantKyc(request: KYCRequest): Promise<boolean>;
	revokeKyc(request: KYCRequest): Promise<boolean>;
	isAccountKYCGranted(request: KYCRequest): Promise<boolean>;
	transfers(request: TransfersRequest): Promise<boolean>;
	update(request: UpdateRequest): Promise<boolean>;
	signTransaction(request: SignTransactionRequest): Promise<boolean>;
	submitTransaction(request: SubmitTransactionRequest): Promise<boolean>;
	removeTransaction(request: RemoveTransactionRequest): Promise<boolean>;
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
	@LogError
	async create(req: CreateRequest): Promise<{
		coin: StableCoinViewModel;
		reserve: ReserveViewModel;
	}> {
		handleValidation('CreateRequest', req);
		const {
			hederaTokenManager,
			reserveAddress,
			reserveInitialAmount,
			createReserve,
			proxyAdminOwnerAccount,
		} = req;

		const stableCoinFactory =
			this.networkService.configuration.factoryAddress;

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
			cashInRoleAllowance: BigDecimal.fromString(
				req.cashInRoleAllowance ?? '0',
				req.decimals,
			),
			metadata: req.metadata,
		};

		const stableCoinFactoryId: string | undefined = (
			await this.mirrorNode.getContractInfo(stableCoinFactory)
		).id;

		const hederaTokenManagerId: string | undefined = hederaTokenManager
			? (await this.mirrorNode.getContractInfo(hederaTokenManager)).id
			: undefined;

		const reserveAddressId: string | undefined = reserveAddress
			? (await this.mirrorNode.getContractInfo(reserveAddress)).id
			: undefined;

		const createResponse = await this.commandBus.execute(
			new CreateCommand(
				coin,
				createReserve,
				stableCoinFactoryId
					? new ContractId(stableCoinFactoryId)
					: undefined,
				hederaTokenManagerId
					? new ContractId(hederaTokenManagerId)
					: undefined,
				reserveAddressId ? new ContractId(reserveAddressId) : undefined,
				reserveInitialAmount
					? BigDecimal.fromString(
							reserveInitialAmount,
							RESERVE_DECIMALS,
					  )
					: undefined,
				proxyAdminOwnerAccount
					? new ContractId(proxyAdminOwnerAccount)
					: undefined,
			),
		);

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
				proxyAdminAddress: createResponse.reserveProxyAdmin,
			},
		};
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
	async cashIn(request: CashInRequest): Promise<boolean> {
		const { tokenId, amount, targetId, startDate } = request;
		handleValidation('CashInRequest', request);

		return (
			await this.commandBus.execute(
				new CashInCommand(
					amount,
					HederaId.from(targetId),
					HederaId.from(tokenId),
					startDate,
				),
			)
		).payload;
	}

	@LogError
	async burn(request: BurnRequest): Promise<boolean> {
		const { tokenId, amount, startDate } = request;
		handleValidation('BurnRequest', request);

		return (
			await this.commandBus.execute(
				new BurnCommand(amount, HederaId.from(tokenId), startDate),
			)
		).payload;
	}

	@LogError
	async rescue(request: RescueRequest): Promise<boolean> {
		const { tokenId, amount, startDate } = request;
		handleValidation('RescueRequest', request);

		return (
			await this.commandBus.execute(
				new RescueCommand(amount, HederaId.from(tokenId), startDate),
			)
		).payload;
	}

	@LogError
	async rescueHBAR(request: RescueHBARRequest): Promise<boolean> {
		const { tokenId, amount, startDate } = request;
		handleValidation('RescueHBARRequest', request);

		return (
			await this.commandBus.execute(
				new RescueHBARCommand(
					amount,
					HederaId.from(tokenId),
					startDate,
				),
			)
		).payload;
	}

	@LogError
	async wipe(request: WipeRequest): Promise<boolean> {
		const { tokenId, amount, targetId, startDate } = request;
		handleValidation('WipeRequest', request);

		return (
			await this.commandBus.execute(
				new WipeCommand(
					amount,
					HederaId.from(targetId),
					HederaId.from(tokenId),
					startDate,
				),
			)
		).payload;
	}

	@LogError
	async associate(request: AssociateTokenRequest): Promise<boolean> {
		const { tokenId, targetId } = request;
		handleValidation('AssociateTokenRequest', request);

		return (
			await this.commandBus.execute(
				new AssociateCommand(
					HederaId.from(targetId),
					HederaId.from(tokenId),
				),
			)
		).payload;
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
	async pause(request: PauseRequest): Promise<boolean> {
		const { tokenId, startDate } = request;
		handleValidation('PauseRequest', request);

		return (
			await this.commandBus.execute(
				new PauseCommand(HederaId.from(tokenId), startDate),
			)
		).payload;
	}

	@LogError
	async unPause(request: PauseRequest): Promise<boolean> {
		const { tokenId, startDate } = request;
		handleValidation('PauseRequest', request);

		return (
			await this.commandBus.execute(
				new UnPauseCommand(HederaId.from(tokenId), startDate),
			)
		).payload;
	}

	@LogError
	async delete(request: DeleteRequest): Promise<boolean> {
		const { tokenId, startDate } = request;
		handleValidation('DeleteRequest', request);

		return (
			await this.commandBus.execute(
				new DeleteCommand(HederaId.from(tokenId), startDate),
			)
		).payload;
	}

	@LogError
	async freeze(request: FreezeAccountRequest): Promise<boolean> {
		const { tokenId, targetId, startDate } = request;
		handleValidation('FreezeAccountRequest', request);

		return (
			await this.commandBus.execute(
				new FreezeCommand(
					HederaId.from(targetId),
					HederaId.from(tokenId),
					startDate,
				),
			)
		).payload;
	}

	@LogError
	async unFreeze(request: FreezeAccountRequest): Promise<boolean> {
		const { tokenId, targetId, startDate } = request;
		handleValidation('FreezeAccountRequest', request);

		return (
			await this.commandBus.execute(
				new UnFreezeCommand(
					HederaId.from(targetId),
					HederaId.from(tokenId),
					startDate,
				),
			)
		).payload;
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
	async grantKyc(request: KYCRequest): Promise<boolean> {
		const { tokenId, targetId } = request;
		handleValidation('KYCRequest', request);

		return (
			await this.commandBus.execute(
				new GrantKycCommand(
					HederaId.from(targetId),
					HederaId.from(tokenId),
				),
			)
		).payload;
	}

	@LogError
	async revokeKyc(request: KYCRequest): Promise<boolean> {
		const { tokenId, targetId } = request;
		handleValidation('KYCRequest', request);
		return (
			await this.commandBus.execute(
				new RevokeKycCommand(
					HederaId.from(targetId),
					HederaId.from(tokenId),
				),
			)
		).payload;
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
	): Promise<boolean> {
		handleValidation('UpdateReserveAddressRequest', request);

		const reserveAddressId: string = (
			await this.mirrorNode.getContractInfo(request.reserveAddress)
		).id;

		return (
			await this.commandBus.execute(
				new UpdateReserveAddressCommand(
					HederaId.from(request.tokenId),
					new ContractId(reserveAddressId),
				),
			)
		).payload;
	}

	@LogError
	async transfers(request: TransfersRequest): Promise<boolean> {
		const { tokenId, targetsId, amounts, targetId } = request;

		handleValidation('TransfersRequest', request);

		const targetsIdHederaIds: HederaId[] = [];
		targetsId.forEach((targetId) => {
			targetsIdHederaIds.push(HederaId.from(targetId));
		});

		return (
			await this.commandBus.execute(
				new TransfersCommand(
					amounts,
					targetsIdHederaIds,
					HederaId.from(tokenId),
					HederaId.from(targetId),
				),
			)
		).payload;
	}

	@LogError
	async update(request: UpdateRequest): Promise<boolean> {
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
		return (
			await this.commandBus.execute(
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
			)
		).payload;
	}

	@LogError
	async signTransaction(request: SignTransactionRequest): Promise<boolean> {
		const { transactionId } = request;

		handleValidation('SignTransactionRequest', request);

		return (await this.commandBus.execute(new SignCommand(transactionId)))
			.payload;
	}

	@LogError
	async submitTransaction(
		request: SubmitTransactionRequest,
	): Promise<boolean> {
		const { transactionId } = request;

		handleValidation('SubmitTransactionRequest', request);

		return (await this.commandBus.execute(new SubmitCommand(transactionId)))
			.payload;
	}

	@LogError
	async removeTransaction(
		request: RemoveTransactionRequest,
	): Promise<boolean> {
		const { transactionId } = request;

		handleValidation('RemoveTransactionRequest', request);

		return (await this.commandBus.execute(new RemoveCommand(transactionId)))
			.payload;
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
