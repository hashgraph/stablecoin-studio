import BaseError from '../../../../../core/error/BaseError.js';
import { BaseRequest } from '../BaseRequest.js';
import {
	ValidationSchema,
	ValidatedRequestKey,
} from './schema/ValidationSchema.js';
import ValidationResponse from './ValidationResponse.js';

export default class ValidatedRequest<T extends BaseRequest>
	implements BaseRequest
{
	private schema: ValidationSchema<T>;

	constructor(schema: ValidationSchema<T>) {
		this.schema = schema;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
				if(err?.length && err.length > 0){
					return new ValidationResponse(err)
				}
			}
		} catch (err) {
			return new ValidationResponse([err as BaseError]);
		}
	}

	validate(key?: ValidatedRequestKey<T>): ValidationResponse[] {
		const vals: ValidationResponse[] = [];
		if (!key) {
			const entries = Object.keys(this.schema);
			entries.forEach((key) => {
				this.pushValidations(key as ValidatedRequestKey<T>, vals);
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
