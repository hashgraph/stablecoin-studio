/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import BaseError from '../../../../../core/error/BaseError.js';
import { BaseRequest } from '../BaseRequest.js';
import { ValidationSchema, ValidatedRequestKey } from './ValidationSchema.js';
import ValidationResponse from './ValidationResponse.js';
import { getOptionalKeys } from '../../../../../core/decorators/OptionalDecorator.js';
import { RuntimeError } from '../../../../../core/error/RuntimeError.js';
export default class ValidatedRequest<T extends BaseRequest> {
	private schema: ValidationSchema<T>;

	constructor(schema: ValidationSchema<T>) {
		this.schema = schema;
	}

	protected getOptionalKeys(): ValidatedRequestKey<T>[] {
		let keys: ValidatedRequestKey<T>[] = [];
		keys = Object.keys(
			getOptionalKeys(this) ?? {},
		) as ValidatedRequestKey<T>[];
		return keys;
	}

	protected isOptional(key: ValidatedRequestKey<T>): boolean {
		return this.getOptionalKeys().includes(key);
	}

	private getProperty(propertyName: keyof this): any {
		return this[propertyName];
	}

	private runValidation(
		propertyName: ValidatedRequestKey<T>,
		val: any,
	): ValidationResponse | undefined {
		if (
			this?.schema[propertyName] &&
			!this.isOptional(propertyName) &&
			val !== undefined
		) {
			try {
				const err = this.schema[propertyName]?.(val);
				if (err?.length && err.length > 0) {
					return new ValidationResponse(err);
				}
			} catch (err) {
				return new ValidationResponse([err as BaseError]);
			}
		} else if (val === undefined && !this.isOptional(propertyName)) {
			throw new RuntimeError(
				`Invalid validation schema for property '${propertyName.toString()}'. Did you forget to add the validation?`,
			);
		}
	}

	validate(key?: ValidatedRequestKey<T>): ValidationResponse[] {
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

	private filterSchemaFromProps(): ValidatedRequestKey<T>[] {
		const schemaEntries = Object.keys(
			this.schema,
		) as ValidatedRequestKey<T>[];
		const entries = Object.keys(this) as ValidatedRequestKey<T>[];
		const filteredEntries = schemaEntries.filter((value) =>
			entries.includes(value),
		);
		return filteredEntries;
	}

	private pushValidations(
		key: ValidatedRequestKey<T>,
		vals: ValidationResponse[],
	): void {
		const err = this.runValidation(
			key,
			this.getProperty(key as keyof this),
		);
		err && vals.push(err);
	}
}
