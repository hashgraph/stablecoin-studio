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

import { CommandBus } from '../../core/command/CommandBus.js';
import Injectable from '../../core/Injectable.js';
import UpdateCustomFeesRequest from './request/UpdateCustomFeesRequest.js';
import { LogError } from '../../core/decorator/LogErrorDecorator.js';
import { handleValidation } from './Common.js';
import { HederaId } from '../../domain/context/shared/HederaId.js';
import { UpdateCustomFeesCommand } from '../../app/usecase/command/stablecoin/fees/updateCustomFees/UpdateCustomFeesCommand.js';

interface ICustomFees {
	updateCustomFees(request: UpdateCustomFeesRequest): Promise<boolean>;
}

class CustomFeesInPort implements ICustomFees {
	constructor(
		private readonly commandBus: CommandBus = Injectable.resolve(
			CommandBus,
		),
	) {}


	@LogError
	async updateCustomFees(request: UpdateCustomFeesRequest): Promise<boolean> {
		const { tokenId, customFees} = request;
		handleValidation('UpdateCustomFeesRequest', request);

		return (
			await this.commandBus.execute(
				new UpdateCustomFeesCommand(
					HederaId.from(tokenId),
					customFees
				),
			)
		).payload;
	}

}

const Fees = new CustomFeesInPort();
export default Fees;