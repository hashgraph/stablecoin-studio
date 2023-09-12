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

import { EmptyValue } from './error/EmptyValue.js';
import { InvalidValue } from './error/InvalidValue.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class TransfersRequest extends ValidatedRequest<TransfersRequest> {
	targetsId: string[];
	amounts: string[];
	tokenId: string;
	targetId: string;

	constructor({
		targetsId,
		amounts,
		tokenId,
		targetId,
	}: {
		targetsId: string[];
		amounts: string[];
		tokenId: string;
		targetId: string;
	}) {
		super({
			targetsId: (vals) => {
				if (vals.length == 0) {
					return [
						new InvalidValue(
							`The list of accounts cannot be empty.`,
						),
					];
				}

				for (let i = 0; i < vals.length; i++) {
					const err = Validation.checkHederaIdFormat()(vals[i]);
					if (err.length > 0) {
						return err;
					}
					if (vals.indexOf(vals[i]) != i) {
						return [
							new InvalidValue(
								`account ${vals[i]} is duplicated`,
							),
						];
					}
				}
			},
			amounts: (vals) => {
				if (!vals) return [new EmptyValue(vals)];

				if (vals.length != this.targetsId.length)
					return [
						new InvalidValue(
							`The list of amounts and the list of accounts must contain the same number of items.`,
						),
					];

				for (let i = 0; i < vals.length; i++) {
					const err = Validation.checkAmount()(vals[i]);
					if (err.length > 0) {
						return err;
					}
				}
			},
			tokenId: Validation.checkHederaIdFormat(),
			targetId: Validation.checkHederaIdFormat(),
		});

		this.targetsId = targetsId;
		this.amounts = amounts;
		this.tokenId = tokenId;
		this.targetId = targetId;
	}
}
