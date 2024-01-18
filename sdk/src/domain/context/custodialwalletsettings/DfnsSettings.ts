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

import PublicKey from "../account/PublicKey.js";
import { HederaId } from "../shared/HederaId.js";
import CustodialWalletSettings from "./CustodialWalletSettings.js";

// export interface DfnsProps {
// 	serviceAccountPrivateKey: string;
// 	serviceAccountCredentialId: string;
// 	serviceAccountAuthToken: string;
// 	appOrigin: string;
// 	appId: string;
// 	baseUrl: string;
// 	walletId: string;
// 	hederaAccountId: HederaId;
// 	hederaAccountPublicKey: PublicKey;
// 	}

export default class DfnsSettings extends CustodialWalletSettings {
	public serviceAccountPrivateKey: string;
	public serviceAccountCredentialId: string;
	public serviceAccountAuthToken: string;
	public appOrigin: string;
	public appId: string;
	public baseUrl: string;
	public walletId: string;
	constructor(
		serviceAccountPrivateKey: string,
		serviceAccountCredentialId: string,
		serviceAccountAuthToken: string,
		appOrigin: string,
		appId: string,
		baseUrl: string,
		walletId: string,
		hederaAccountId: HederaId,
		hederaAccountPublicKey: PublicKey,
	) {
		super(hederaAccountId, hederaAccountPublicKey);
		this.serviceAccountPrivateKey = serviceAccountPrivateKey;
		this.serviceAccountCredentialId = serviceAccountCredentialId;
		this.serviceAccountAuthToken = serviceAccountAuthToken;
		this.appOrigin = appOrigin;
		this.appId = appId;
		this.baseUrl = baseUrl;
		this.walletId = walletId;
	}
}
