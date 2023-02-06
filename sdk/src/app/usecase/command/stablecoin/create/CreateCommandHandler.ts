/*
 *
 * Hedera Stable Coin SDK
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

@CommandHandler(CreateCommand)
export class CreateCommandHandler implements ICommandHandler<CreateCommand> {
	constructor(
		@lazyInject(AccountService)
		public readonly accountService: AccountService,
		@lazyInject(TransactionService)
		public readonly transactionService: TransactionService,
		@lazyInject(NetworkService)
		public readonly networkService: NetworkService,
	) {}

	async execute(command: CreateCommand): Promise<CreateCommandResponse> {
		const { coin, reserveAddress, reserveInitialAmount, createReserve } =
			command;
		let { factory, hederaERC20 } = command;

		if (
			!factory &&
			!hederaERC20 &&
			this.networkService.configuration.factoryAddress === '' &&
			this.networkService.configuration.hederaERC20Address === ''
		) {
			throw new InvalidRequest(
				'HederaERC20 and factory not found in request or in configuration',
			);
		}
		if (!hederaERC20) {
			hederaERC20 = new ContractId(
				this.networkService.configuration.hederaERC20Address,
			);
		}
		if (!factory) {
			factory = new ContractId(
				this.networkService.configuration.factoryAddress,
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

		if (
			createReserve &&
			reserveInitialAmount &&
			coin.initialSupply &&
			coin.initialSupply
				.setDecimals(commonDecimals)
				.isGreaterThan(reserveInitialAmount.setDecimals(commonDecimals))
		) {
			throw new OperationNotAllowed(
				'Initial supply cannot be more than the reserve initial amount',
			);
		}

		const res = await handler.create(
			new StableCoin(coin),
			factory,
			hederaERC20,
			createReserve,
			reserveAddress,
			reserveInitialAmount,
		);
		return Promise.resolve(
			new CreateCommandResponse(
				ContractId.fromHederaContractId(
					HContractId.fromSolidityAddress(res.response[0][3]),
				),
				ContractId.fromHederaContractId(
					HContractId.fromSolidityAddress(res.response[0][4]),
				),
				ContractId.fromHederaContractId(
					HContractId.fromSolidityAddress(res.response[0][5]),
				),
			),
		);
	}
}
