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

import { HederaId } from '../../../domain/context/shared/HederaId.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class GetAccountsWithRolesRequest extends ValidatedRequest<GetAccountsWithRolesRequest> {
	roleId: string;
	tokenId: HederaId;
	initial: string
	max: string

	constructor({ roleId,tokenId,initial, max }: { roleId: string; tokenId:HederaId, initial: string, max: string}) {
		super({
			roleId: Validation.checkRole(),
			tokenId: Validation.checkHederaIdFormat(),
			initial: Validation.checkNumber(),
			max: Validation.checkNumber()
		});
		this.roleId = roleId;
		this.tokenId = tokenId;
		this.initial = initial;
		this.max = max;
		
	
	}
}
