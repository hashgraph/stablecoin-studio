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

import Injectable from '../../core/Injectable.js';
import ContractId from '../../domain/context/contract/ContractId.js';
import GetConfigInfoRequest from './request/GetConfigInfoRequest';
import UpdateConfigRequest from './request/UpdateConfigRequest';
import UpdateConfigVersionRequest from './request/UpdateConfigVersionRequest';
import UpdateResolverRequest from './request/UpdateResolverRequest';
import { CommandBus } from '../../core/command/CommandBus.js';
import { handleValidation } from './Common.js';
import { QueryBus } from '../../core/query/QueryBus.js';
import { LogError } from '../../core/decorator/LogErrorDecorator.js';
import { UpdateResolverCommand } from '../../app/usecase/command/stablecoin/management/updateResolver/updateResolverCommand.js';
import { HederaId } from '../../domain/context/shared/HederaId.js';
import { UpdateConfigVersionCommand } from '../../app/usecase/command/stablecoin/management/updateConfigVersion/updateConfigVersionCommand.js';
import { UpdateConfigCommand } from '../../app/usecase/command/stablecoin/management/updateConfig/updateConfigCommand.js';
import { GetConfigInfoQuery } from '../../app/usecase/query/stablecoin/management/getConfigInfo/GetConfigInfoQuery.js';
import ConfigInfoViewModel from './response/ConfigInfoViewModel.js';
import { TransactionResult } from '../../domain/context/transaction/TransactionResult.js';
import { SerializedTransactionData } from '../../domain/context/transaction/TransactionResponse.js';


interface IManagementInPort {
	updateConfigVersion(request: UpdateConfigVersionRequest): Promise<TransactionResult>;
	buildUpdateConfigVersion(request: UpdateConfigVersionRequest): Promise<SerializedTransactionData>;
	updateConfig(request: UpdateConfigRequest): Promise<TransactionResult>;
	buildUpdateConfig(request: UpdateConfigRequest): Promise<SerializedTransactionData>;
	getConfigInfo(request: GetConfigInfoRequest): Promise<ConfigInfoViewModel>;
	updateResolver(request: UpdateResolverRequest): Promise<TransactionResult>;
	buildUpdateResolver(request: UpdateResolverRequest): Promise<SerializedTransactionData>;
}

class ManagementInPort implements IManagementInPort {
	constructor(
		private readonly commandBus: CommandBus = Injectable.resolve(
			CommandBus,
		),
		private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
	) {}

	@LogError
	async updateConfigVersion(
		request: UpdateConfigVersionRequest,
	): Promise<TransactionResult> {
		const { configVersion, tokenId } = request;
		handleValidation('UpdateConfigVersionRequest', request);

		const response = await this.commandBus.execute(
			new UpdateConfigVersionCommand(
				HederaId.from(tokenId),
				configVersion,
			),
		);
		return new TransactionResult(response.payload, response.transactionId);
	}

	@LogError
	async buildUpdateConfigVersion(
		request: UpdateConfigVersionRequest,
	): Promise<SerializedTransactionData> {
		const { configVersion, tokenId } = request;
		handleValidation('UpdateConfigVersionRequest', request);

		const response = await this.commandBus.execute(
			new UpdateConfigVersionCommand(
				HederaId.from(tokenId),
				configVersion,
			),
		);
		if (!response.serializedTransactionData) throw new Error("Expected serialized transaction data but none was returned");
		return response.serializedTransactionData;
	}

	@LogError
	async updateConfig(request: UpdateConfigRequest): Promise<TransactionResult> {
		const { configId, configVersion, tokenId } = request;
		handleValidation('UpdateConfigRequest', request);

		const response = await this.commandBus.execute(
			new UpdateConfigCommand(
				HederaId.from(tokenId),
				configId,
				configVersion,
			),
		);
		return new TransactionResult(response.payload, response.transactionId);
	}

	@LogError
	async buildUpdateConfig(request: UpdateConfigRequest): Promise<SerializedTransactionData> {
		const { configId, configVersion, tokenId } = request;
		handleValidation('UpdateConfigRequest', request);

		const response = await this.commandBus.execute(
			new UpdateConfigCommand(
				HederaId.from(tokenId),
				configId,
				configVersion,
			),
		);
		if (!response.serializedTransactionData) throw new Error("Expected serialized transaction data but none was returned");
		return response.serializedTransactionData;
	}

	@LogError
	async updateResolver(request: UpdateResolverRequest): Promise<TransactionResult> {
		const { configId, tokenId, resolver, configVersion } = request;
		handleValidation('UpdateResolverRequest', request);

		const response = await this.commandBus.execute(
			new UpdateResolverCommand(
				HederaId.from(tokenId),
				configVersion,
				configId,
				new ContractId(resolver),
			),
		);
		return new TransactionResult(response.payload, response.transactionId);
	}

	@LogError
	async buildUpdateResolver(request: UpdateResolverRequest): Promise<SerializedTransactionData> {
		const { configId, tokenId, resolver, configVersion } = request;
		handleValidation('UpdateResolverRequest', request);

		const response = await this.commandBus.execute(
			new UpdateResolverCommand(
				HederaId.from(tokenId),
				configVersion,
				configId,
				new ContractId(resolver),
			),
		);
		if (!response.serializedTransactionData) throw new Error("Expected serialized transaction data but none was returned");
		return response.serializedTransactionData;
	}

	@LogError
	async getConfigInfo(
		request: GetConfigInfoRequest,
	): Promise<ConfigInfoViewModel> {
		const { tokenId } = request;
		handleValidation('GetConfigInfoRequest', request);

		const { resolverAddress, configId, configVersion } = (
			await this.queryBus.execute(
				new GetConfigInfoQuery(HederaId.from(tokenId)),
			)
		).payload;

		return {
			resolverAddress,
			configId,
			configVersion,
		};
	}
}

const Management = new ManagementInPort();
export default Management;
