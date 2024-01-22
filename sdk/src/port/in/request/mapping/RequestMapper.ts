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

/* eslint-disable @typescript-eslint/no-explicit-any */
import LogService from '../../../../app/service/LogService.js';
import { isConstructible } from '../../../../core/Cast.js';
import { Constructible, MapFunction } from '../../../../core/Type.js';
import Account from '../../../../domain/context/account/Account.js';
import PrivateKey from '../../../../domain/context/account/PrivateKey.js';
import PublicKey from '../../../../domain/context/account/PublicKey.js';
import {
	FireblocksConfigRequest,
	DFNSConfigRequest,
} from '../ConnectRequest.js';
import {
	RequestAccount,
	RequestPrivateKey,
	RequestPublicKey,
} from '../BaseRequest.js';
import ValidatedRequest from '../validation/ValidatedRequest.js';
import DfnsSettings from '../../../../domain/context/custodialwalletsettings/DfnsSettings.js';
import FireblocksSettings from '../../../../domain/context/custodialwalletsettings/FireblocksSettings.js';

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

	public static isRole = (val: any): val is string => {
		if (val === undefined || !val) {
			return false;
		}
		const keys = Object.getOwnPropertyNames({});
		return keys.includes(val);
	};

	public static getAccount(req: RequestAccount): Account {
		return new Account({
			id: req.accountId,
			privateKey: this.getPrivateKey(req.privateKey),
			publicKey: this.getPrivateKey(req.privateKey)?.publicKey,
			evmAddress: req.evmAddress,
		});
	}

	public static getPrivateKey(
		req?: RequestPrivateKey,
	): PrivateKey | undefined {
		if (req) {
			return new PrivateKey(req);
		} else return undefined;
	}

	public static getPublicKey(req?: RequestPublicKey): PublicKey | undefined {
		if (req) {
			return new PublicKey(req);
		} else return undefined;
	}

	public static getAccountId(id?: string): string | undefined {
		if (id) {
			return String(id);
		} else return undefined;
	}

	/**
	 *
	 * @param req ValidatedRequest<T> --> The request to map from
	 * @param extra { [key in keyof ValidatedRequest<T>]: any } --> Extra parameter type mappings
	 * @example
	 * const req: ICreateStableCoinServiceRequestModel = RequestMapper.map(request,{
				treasury: AccountId,
				autoRenewAccount: AccountId,
			})
	 * @returns The constructed mapped request
	 */
	public static map<
		T extends ValidatedRequest<T>,
		K extends { [key in keyof T]: any },
	>(
		req: T,
		extra?: Partial<{
			[p in keyof K]: Constructible | MapFunction<any, any, T>;
		}>,
	): K {
		LogService.logTrace('Mapping: ', req);
		const entries = Object.entries(req);
		const extraKeys = this.renamePrivateProps(Object.keys(extra ?? {}));
		const target: { [n: string]: any } = {};
		entries.forEach(([key, val]) => {
			key = this.renamePrivateProps(key);
			if (
				extra &&
				extraKeys.includes(key) &&
				val !== undefined &&
				val !== null
			) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const cll = extra[key as keyof K];
				if (isConstructible(cll)) {
					target[key] = new cll(val);
				} else if (cll) {
					target[key] = cll(val, req);
				}
			} else if (this.isPublicKey(val)) {
				target[key] = this.getPublicKey(val);
			} else if (this.isAccount(val)) {
				target[key] = this.getAccount(val);
			} else {
				target[key] = val;
			}
		});
		LogService.logTrace('To: ', target);
		return target as K;
	}

	public static renamePrivateProps(keys: string[]): string[];
	public static renamePrivateProps(keys: string): string;
	public static renamePrivateProps(keys: string | string[]): any {
		if (typeof keys === 'string') {
			return keys.startsWith('_') || keys.startsWith('#')
				? keys.substring(1)
				: keys;
		} else {
			return keys.map((key) =>
				key.startsWith('_') || key.startsWith('#')
					? key.substring(1)
					: key,
			);
		}
	}

	public static findPrivateProps(keys: string[]): string[];
	public static findPrivateProps(keys: string): string;
	public static findPrivateProps(keys: string | string[]): any {
		if (typeof keys === 'string') {
			return keys.startsWith('_') || keys.startsWith('#')
				? keys
				: undefined;
		} else {
			return keys.filter(
				(key) => key.startsWith('_') || key.startsWith('#'),
			);
		}
	}

	public static mapAccount(account?: RequestAccount): Account | undefined {
		return account
			? new Account({
					id: account.accountId,
					evmAddress: account.evmAddress,
					privateKey:
						account.privateKey?.key && account.privateKey.type
							? new PrivateKey({
									key: account.privateKey?.key ?? '',
									type: account.privateKey?.type ?? '',
							  })
							: undefined,
			  })
			: undefined;
	}

	public static dfnsRequestToDfnsSettings(
		req: DFNSConfigRequest,
	): DfnsSettings {
		return new DfnsSettings(
			req.serviceAccountPrivateKey,
			req.credentialId,
			req.authorizationToken,
			req.urlApplicationOrigin,
			req.applicationId,
			req.testUrl,
			req.walletId,
			req.hederaAccountId,
			req.hederaAccountPublicKey,
		);
	}

	public static fireblocksRequestToFireblocksSettings(
		req: FireblocksConfigRequest,
	): FireblocksSettings {
		return new FireblocksSettings(
			req.apiKey,
			req.apiSecretKey,
			req.baseUrl,
			req.vaultAccountId,
			req.assetId,
			req.hederaAccountId,
			req.hederaAccountPublicKey,
		);
	}
}
