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

/* eslint-disable @typescript-eslint/no-explicit-any */
import ValidatedRequest from './validation/ValidatedRequest.js';
import { OptionalField } from '../../../core/decorator/OptionalDecorator.js';
import Validation from './validation/Validation.js';
import BaseError from '../../../core/error/BaseError.js';
import { InvalidSupplierType } from '../../../domain/context/stablecoin/error/InvalidSupplierType.js';
import { StableCoinRole } from '../../../domain/context/stablecoin/StableCoinRole.js';

export default class GrantRoleRequest extends ValidatedRequest<GrantRoleRequest> {
	targetId: string;
	tokenId: string;
	role: StableCoinRole | undefined;

	@OptionalField()
	supplierType?: string | undefined;

	@OptionalField()
	amount?: string | undefined;

	constructor({
		targetId,
		tokenId,
		role,
		supplierType,
		amount,
	}: {
		targetId: string;
		tokenId: string;
		role: StableCoinRole | undefined;
		supplierType?: string;
		amount?: string;
	}) {
		super({
			targetId: Validation.checkHederaIdFormat(),
			tokenId: Validation.checkHederaIdFormat(),
			role: Validation.checkRole(),
			supplierType: GrantRoleRequest.checkSupplierType(),
			amount: Validation.checkAmount(),
		});
		this.tokenId = tokenId;
		this.targetId = targetId;
		this.role = role;
		this.supplierType = supplierType;
		this.amount = amount;
	}

	private static checkSupplierType = () => {
		return (val: any): BaseError[] => {
			const err: BaseError[] = [];
			const supplierTypes: string[] = ['limited', 'unlimited'];
			if (!supplierTypes.includes(val.toLowerCase())) {
				err.push(new InvalidSupplierType(val));
			}
			return err;
		};
	};
}
