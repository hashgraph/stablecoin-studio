/* eslint-disable @typescript-eslint/no-explicit-any */
import BaseError from '../../../../../core/error/BaseError.js';
import { BaseRequest } from '../BaseRequest.js';
import { ValidationSchema, ValidatedRequestKey } from './ValidationSchema.js';
import ValidationResponse from './ValidationResponse.js';

export default class ValidatedRequest<T extends BaseRequest> {
	private schema: ValidationSchema<T>;

	constructor(schema: ValidationSchema<T>) {
		this.schema = schema;
	}

	private getProperty(propertyName: keyof this): any {
		return this[propertyName];
	}

	private runValidation(
		propertyName: ValidatedRequestKey<T>,
		val: any,
	): ValidationResponse | undefined {
		try {
			if (this?.schema[propertyName]) {
				const err = this.schema[propertyName]?.(val);
				if (err?.length && err.length > 0) {
					return new ValidationResponse(err);
				}
			}
		} catch (err) {
			return new ValidationResponse([err as BaseError]);
		}
	}

	validate(key?: ValidatedRequestKey<T>): ValidationResponse[] {
		const vals: ValidationResponse[] = [];
		if (!key) {
			const entries = Object.keys(
				this.schema,
			) as ValidatedRequestKey<T>[];
			entries.forEach((key) => {
				this.pushValidations(key, vals);
			});
		} else {
			this.pushValidations(key, vals);
		}
		return vals;
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
