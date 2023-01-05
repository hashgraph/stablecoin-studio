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

import {
	AccountId as HAccountId,
} from '@hashgraph/sdk';

export class StableCoinMemo {
	proxyContract: string;
    proxyAdminContract: string;

	constructor(proxyContract: string, proxyAdminContract: string) {
		this.proxyContract = this.getHederaIdfromContractAddress(proxyContract);
		this.proxyAdminContract = this.getHederaIdfromContractAddress(proxyAdminContract);
	}

    getHederaIdfromContractAddress(contractAddress: string): string{
		if(!contractAddress) return '';
        if(contractAddress.length >= 40) return HAccountId.fromSolidityAddress(contractAddress).toString();
		return contractAddress;
    }

	public static fromJson(json: string): StableCoinMemo {
		const jsonObject = JSON.parse(json);
		return new StableCoinMemo(
			jsonObject.p,
            jsonObject.a
		);
	}

	public static empty(): StableCoinMemo {
		const emptyObject = {
			proxyContract: '',
            proxyAdminContract: ''
		};
		return this.fromJson(JSON.stringify(emptyObject));
	}

	public toJson(): string {
		return JSON.stringify({
			proxyContract: this.proxyContract,
            proxyAdminContract: this.proxyAdminContract
		});
	}
}