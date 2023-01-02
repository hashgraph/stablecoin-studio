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
import 'reflect-metadata';
import { BaseRequest } from '../BaseRequest.js';
import { ValidationSchema, ValidatedRequestKey } from './ValidationSchema.js';
import ValidationResponse from './ValidationResponse.js';
import { EmptyValue } from '../error/EmptyValue.js';
import RequestMapper from '../mapping/RequestMapper.js';
import { getOptionalFields } from '../../../../core/decorator/OptionalDecorator.js';
import BaseError from '../../../../core/error/BaseError.js';
import { RuntimeError } from '../../../../core/error/RuntimeError.js';
export default class ValidatedRequest<T extends BaseRequest> {
	private schema: ValidationSchema<T>;

	constructor(schema: ValidationSchema<T>) {
		this.schema = schema;
	}

	public validate(key?: ValidatedRequestKey<T>): ValidationResponse[] {
		const vals: ValidationResponse[] = [];
		if (!key) {
			const filteredEntries = this.filterSchemaFromProps();
			filteredEntries.forEach((key) => {
				this.pushValidations(key, vals);
			});
		} else {
			this.pushValidations(key, vals);
		}
		return vals;
	}

	protected getOptionalFields(): ValidatedRequestKey<T>[] {
		let keys: ValidatedRequestKey<T>[] = [];
		keys = Object.keys(
			getOptionalFields(this) ?? {},
		) as ValidatedRequestKey<T>[];
		return keys;
	}

	protected isOptional(key: ValidatedRequestKey<T>): boolean {
		return this.getOptionalFields().includes(key);
	}

	private getProperty(propertyName: keyof this): any {
		if (this[propertyName] === undefined) {
			const privateKeys = {
				dash: `_${String(propertyName)}` as keyof this,
				hash: `#${String(propertyName)}` as keyof this,
			};
			if (this[privateKeys.dash]) {
				return this[privateKeys.dash];
			} else {
				return this[privateKeys.hash];
			}
		}
		return this[propertyName];
	}

	private runValidation(
		propertyName: ValidatedRequestKey<T>,
		val: any,
	): ValidationResponse | undefined {
		if (this?.schema[propertyName] && val !== undefined) {
			try {
				const err = this.schema[propertyName]?.(val);
				if (err?.length && err.length > 0) {
					return new ValidationResponse(propertyName.toString(), err);
				}
			} catch (err) {
				return new ValidationResponse(propertyName.toString(), [
					err as BaseError,
				]);
			}
		} else if (
			this?.schema[propertyName] &&
			!this.isOptional(propertyName) &&
			val === undefined
		) {
			return new ValidationResponse(propertyName.toString(), [
				new EmptyValue(propertyName),
			]);
		} else if (
			!this?.schema[propertyName] &&
			!this.isOptional(propertyName)
		) {
			throw new RuntimeError(
				`Invalid validation schema for property '${propertyName.toString()}'. Did you forget to add the validation?`,
			);
		}
	}

	private filterSchemaFromProps(): ValidatedRequestKey<T>[] {
		const schemaEntries = Object.keys(
			this.schema,
		) as ValidatedRequestKey<T>[];
		const entries = RequestMapper.renamePrivateProps(
			Object.keys(this),
		) as ValidatedRequestKey<T>[];
		const filteredEntries = schemaEntries.filter((value) =>
			entries.includes(value),
		);
		return filteredEntries;
	}

	private pushValidations(
		key: ValidatedRequestKey<T>,
		vals: ValidationResponse[],
	): void {
		try {
			const err = this.runValidation(
				key,
				this.getProperty(key as keyof this),
			);
			err && vals.push(err);
		} catch (err) {
			vals.push(
				new ValidationResponse(key.toString(), [err as BaseError]),
			);
		}
	}
}
