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

import { StableCoinRole } from '../../../domain/context/stablecoin/StableCoinRole.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class RevokeRoleRequest extends ValidatedRequest<RevokeRoleRequest> {
	targetId: string;
	tokenId: string;
	role: StableCoinRole | undefined;

	constructor({
		targetId,
		tokenId,
		role,
	}: {
		targetId: string;
		tokenId: string;
		role: StableCoinRole | undefined;
	}) {
		super({
			targetId: Validation.checkHederaIdFormat(),
			tokenId: Validation.checkHederaIdFormat(),
			role: Validation.checkRole(),
		});
		this.tokenId = tokenId;
		this.targetId = targetId;
		this.role = role;
	}
}
