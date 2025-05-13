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
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter.js';
import { RPCQueryAdapter } from '../../../../../port/out/rpc/RPCQueryAdapter.js';
import BigDecimal from '../../../../../domain/context/shared/BigDecimal.js';
import EvmAddress from '../../../../../domain/context/contract/EvmAddress.js';
import {
	ADDRESS_LENGTH,
	BYTES_32_LENGTH,
	EVM_ZERO_ADDRESS,
	TOPICS_IN_FACTORY_RESULT,
} from '../../../../../core/Constants';

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
			coin,
			reserveAddress,
			reserveInitialAmount,
			createReserve,
			proxyOwnerAccount,
			resolver,
			configId,
			configVersion,
			reserveConfigId,
			reserveConfigVersion,
		} = command;

		if (!factory) {
			throw new InvalidRequest('Factory not found in request');
		}

		if (!resolver) {
			throw new InvalidRequest('Resolver not found in request');
		}

		if (!configId) {
			throw new InvalidRequest('Config Id not found in request');
		}

		if (!proxyOwnerAccount) {
			throw new InvalidRequest(
				'Proxy Owner Account not found in request',
			);
		}

		if (configVersion === undefined) {
			throw new InvalidRequest('Config Version not found in request');
		}

		if (createReserve && (!reserveConfigId || !reserveConfigVersion)) {
			throw new InvalidRequest(
				'Cannot create reserve without reserve config id and version',
			);
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
			createReserve,
			resolver,
			configId,
			configVersion,
			proxyOwnerAccount,
			reserveAddress,
			reserveInitialAmount,
			reserveConfigId,
			reserveConfigVersion,
		);

		if (!res.id)
			throw new Error('Create Command Handler response id empty');

		await new Promise((resolve) => setTimeout(resolve, 5000));

		try {
			const results = await this.mirrorNodeAdapter.getContractResults(
				res.id.toString(),
				TOPICS_IN_FACTORY_RESULT,
			);

			console.log(`Creation event data:${JSON.stringify(results)}`); //! Remove this line

			if (!results || results.length !== TOPICS_IN_FACTORY_RESULT) {
				throw new Error('Invalid data structure');
			}

			const data = results.map(
				(result) =>
					'0x' +
					result.substring(BYTES_32_LENGTH - ADDRESS_LENGTH + 2),
			);

			console.log(data);

			if (data && data.length === TOPICS_IN_FACTORY_RESULT) {
				return Promise.resolve(
					new CreateCommandResponse(
						ContractId.fromHederaContractId(
							HContractId.fromEvmAddress(0, 0, data[1]),
						),
						data[0] === EVM_ZERO_ADDRESS
							? new ContractId('0.0.0')
							: ContractId.fromHederaContractId(
									HContractId.fromString(
										(
											await this.mirrorNodeAdapter.getContractInfo(
												data[0],
											)
										).id,
									),
							  ),
						data[2] === EVM_ZERO_ADDRESS
							? new ContractId('0.0.0')
							: ContractId.fromHederaContractId(
									HContractId.fromString(
										(
											await this.mirrorNodeAdapter.getContractInfo(
												data[2],
											)
										).id,
									),
							  ),
					),
				);
			} else {
				throw new Error('Invalid data structure');
			}
		} catch (e) {
			console.error(e);
			return Promise.resolve(
				new CreateCommandResponse(
					new ContractId('0.0.0'),
					new ContractId('0.0.0'),
					new ContractId('0.0.0'),
				),
			);
		}
	}
}
