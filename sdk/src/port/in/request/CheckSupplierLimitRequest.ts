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

import { OptionalField } from '../../../core/decorator/OptionalDecorator.js';
import BaseError from '../../../core/error/BaseError.js';
import { InvalidSupplierType } from '../../../domain/context/stablecoin/error/InvalidSupplierType.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class CheckSupplierLimitRequest extends ValidatedRequest<CheckSupplierLimitRequest> {
	targetId: string;
	tokenId: string;
	@OptionalField()
	supplierType?: string;

	constructor({
		targetId,
		tokenId,
		supplierType,
	}: {
		targetId: string;
		tokenId: string;
		supplierType?: string;
	}) {
		super({
			targetId: Validation.checkHederaIdFormat(),
			tokenId: Validation.checkHederaIdFormat(),
			supplierType: CheckSupplierLimitRequest.checkSupplierType(),
		});
		this.targetId = targetId;
		this.tokenId = tokenId;
		this.supplierType = supplierType;
	}

	private static checkSupplierType = () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (val: any): BaseError[] => {
			const err: BaseError[] = [];
			const supplierTypes: string[] = ['limited', 'unlimited'];
			if (!supplierTypes.includes(val)) {
				err.push(new InvalidSupplierType(val));
			}
			return err;
		};
	};
}
