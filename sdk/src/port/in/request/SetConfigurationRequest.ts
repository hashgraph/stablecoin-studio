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

import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export interface SetConfigurationRequestProps {
	hederaERC20Address: string;
	factoryAddress: string;
}

export default class SetConfigurationRequest extends ValidatedRequest<SetConfigurationRequest> {
	hederaERC20Address: string;
	factoryAddress: string;

	constructor(props: SetConfigurationRequestProps) {
		super({
			factoryAddress: Validation.checkContractId(),
			hederaERC20Address: Validation.checkContractId(),
		});
		this.hederaERC20Address = props.hederaERC20Address;
		this.factoryAddress = props.factoryAddress;
	}
}
