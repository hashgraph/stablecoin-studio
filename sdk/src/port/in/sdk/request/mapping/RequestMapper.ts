/* eslint-disable @typescript-eslint/no-explicit-any */
import { Constructible } from '../../../../../core/types.js';
import { Account, AccountId, PrivateKey, PublicKey } from '../../sdk.js';
import {
	RequestAccount,
	RequestPrivateKey,
	RequestPublicKey,
} from '../BaseRequest.js';
import ValidatedRequest from '../validation/ValidatedRequest.js';

export default class RequestMapper {
	public static isPublicKey = (val: any): val is RequestPublicKey => {
		if (val === undefined || !val) {
			return false;
		}
		const keys = Object.getOwnPropertyNames(val);
		return keys.includes('key') && keys.includes('type');
	};

	public static isAccount = (val: any): val is RequestAccount => {
		if (val === undefined || !val) {
			return false;
		}
		const keys = Object.getOwnPropertyNames(val);
		return keys.includes('accountId');
	};

	public static getAccount(req: RequestAccount): Account {
		return new Account(
			req.accountId,
			this.getPrivateKey(req.privateKey),
			req.evmAddress,
		);
	}

	public static getPrivateKey(
		req?: RequestPrivateKey,
	): PrivateKey | undefined {
		if (req) {
			return new PrivateKey(req.key, req.type);
		} else return undefined;
	}

	public static getPublicKey(key?: RequestPublicKey): PublicKey | undefined {
		if (key) {
			return new PublicKey(key);
		} else return undefined;
	}

	public static getAccountId(id?: string): AccountId | undefined {
		if (id) {
			return new AccountId(id);
		} else return undefined;
	}

	public static map<
		T extends ValidatedRequest<T>,
		K extends { [key in keyof T]: any },
	>(req: T, extra?: Partial<{ [p in keyof K]: Constructible }>): K {
		const entries = Object.entries(req);
		const extraKeys = Object.keys(extra ?? {});
		const target: { [n: string]: any } = {};
		entries.forEach(([key, val]) => {
			if (
				extra &&
				extraKeys.includes(key) &&
				val !== undefined &&
				val !== null
			) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				target[key] = new extra[key as keyof K]!(val);
			} else if (this.isPublicKey(val)) {
				target[key] = this.getPublicKey(val);
			} else if (this.isAccount(val)) {
				target[key] = this.getAccount(val);
			} else {
				target[key] = val;
			}
		});
		return target as K;
	}
}
