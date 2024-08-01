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

import { ContractId as HContractId } from '@hashgraph/sdk';
import { ICommandHandler } from '../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator.js';
import ContractId from '../../../../../domain/context/contract/ContractId.js';
import { StableCoin } from '../../../../../domain/context/stablecoin/StableCoin.js';
import AccountService from '../../../../service/AccountService.js';
import TransactionService from '../../../../service/TransactionService.js';
import NetworkService from '../../../../service/NetworkService.js';
import { OperationNotAllowed } from '../error/OperationNotAllowed.js';
import { CreateCommand, CreateCommandResponse } from './CreateCommand.js';
import { RESERVE_DECIMALS } from '../../../../../domain/context/reserve/Reserve.js';
import { InvalidRequest } from '../error/InvalidRequest.js';
import { EVM_ZERO_ADDRESS } from '../../../../../core/Constants.js';
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter.js';
import { RPCQueryAdapter } from '../../../../../port/out/rpc/RPCQueryAdapter.js';
import BigDecimal from '../../../../../domain/context/shared/BigDecimal.js';
import EvmAddress from '../../../../../domain/context/contract/EvmAddress.js';

@CommandHandler(CreateCommand)
export class CreateCommandHandler implements ICommandHandler<CreateCommand> {
	constructor(
		@lazyInject(AccountService)
		public readonly accountService: AccountService,
		@lazyInject(TransactionService)
		public readonly transactionService: TransactionService,
		@lazyInject(NetworkService)
		public readonly networkService: NetworkService,
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNodeAdapter: MirrorNodeAdapter,
		@lazyInject(RPCQueryAdapter)
		public readonly queryAdapter: RPCQueryAdapter,
	) {}

	async execute(command: CreateCommand): Promise<CreateCommandResponse> {
		const {
			factory,
			hederaTokenManager,
			coin,
			reserveAddress,
			reserveInitialAmount,
			createReserve,
			proxyAdminOwnerAccount,
		} = command;

		if (!factory) {
			throw new InvalidRequest('Factory not found in request');
		}

		if (!hederaTokenManager) {
			throw new InvalidRequest('HederaTokenManager not found in request');
		}

		const handler = this.transactionService.getHandler();
		if (
			coin.maxSupply &&
			coin.initialSupply &&
			coin.initialSupply.isGreaterThan(coin.maxSupply)
		) {
			throw new OperationNotAllowed(
				'Initial supply cannot be more than the max supply',
			);
		}

		const commonDecimals =
			RESERVE_DECIMALS > coin.decimals ? RESERVE_DECIMALS : coin.decimals;

		if (coin.initialSupply) {
			if (
				createReserve &&
				reserveInitialAmount &&
				coin.initialSupply
					.setDecimals(commonDecimals)
					.isGreaterThan(
						reserveInitialAmount.setDecimals(commonDecimals),
					)
			) {
				throw new OperationNotAllowed(
					'Initial supply cannot be more than the reserve initial amount',
				);
			} else if (reserveAddress) {
				const reserveContractEvmAddress = (
					await this.mirrorNodeAdapter.getContractInfo(
						reserveAddress.value,
					)
				).evmAddress;
				const reserveAmount = BigDecimal.fromStringFixed(
					(
						await this.queryAdapter.getReserveLatestRoundData(
							new EvmAddress(reserveContractEvmAddress),
						)
					)[1].toString(),
					RESERVE_DECIMALS,
				);

				if (
					coin.initialSupply
						.setDecimals(commonDecimals)
						.isGreaterThan(
							reserveAmount.setDecimals(commonDecimals),
						)
				) {
					throw new OperationNotAllowed(
						'Initial supply cannot be more than the reserve initial amount',
					);
				}
			}
		}

		const res = await handler.create(
			new StableCoin(coin),
			factory,
			hederaTokenManager,
			createReserve,
			reserveAddress,
			reserveInitialAmount,
			proxyAdminOwnerAccount,
		);

		try {
			return Promise.resolve(
				new CreateCommandResponse(
					ContractId.fromHederaContractId(
						HContractId.fromSolidityAddress(res.response[0][3]),
					),
					res.response[0][4] === EVM_ZERO_ADDRESS
						? new ContractId('0.0.0')
						: ContractId.fromHederaContractId(
								HContractId.fromString(
									(
										await this.mirrorNodeAdapter.getContractInfo(
											res.response[0][4],
										)
									).id,
								),
						  ),
					res.response[0][5] === EVM_ZERO_ADDRESS
						? new ContractId('0.0.0')
						: ContractId.fromHederaContractId(
								HContractId.fromString(
									(
										await this.mirrorNodeAdapter.getContractInfo(
											res.response[0][5],
										)
									).id,
								),
						  ),
				),
			);
		} catch (e) {
			if (res.response == 1)
				return Promise.resolve(
					new CreateCommandResponse(
						new ContractId('0.0.0'),
						new ContractId('0.0.0'),
						new ContractId('0.0.0'),
					),
				);
			else throw e;
		}
	}
}
