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

import { OptionalField } from '../../../core/decorator/OptionalDecorator.js';
import { Environment } from '../../../domain/context/network/Environment.js';
import { MirrorNode } from '../../../domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../../domain/context/network/JsonRpcRelay.js';
import { SupportedWallets } from '../../../domain/context/network/Wallet.js';
import { BaseRequest, RequestAccount } from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export { SupportedWallets };

export interface DFNSConfigRequest {
	authorizationToken: string;
	credentialId: string;
	serviceAccountPrivateKey: string;
	urlApplicationOrigin: string;
	applicationId: string;
	baseUrl: string;
	walletId: string;
	hederaAccountId: string;
	hederaAccountPublicKey: string; // TODO: check if public key is mandatory or can be retrieved from the custodial service
}

export interface FireblocksConfigRequest {
	apiSecretKey: string;
	apiKey: string;
	baseUrl: string;
	vaultAccountId: string;
	assetId: string;
	hederaAccountId: string;
	hederaAccountPublicKey: string;
}

type CustodialSettings = DFNSConfigRequest | FireblocksConfigRequest;

export default class ConnectRequest
	extends ValidatedRequest<ConnectRequest>
	implements BaseRequest
{
	@OptionalField()
	account?: RequestAccount;
	network: Environment;
	mirrorNode: MirrorNode;
	rpcNode: JsonRpcRelay;
	wallet: SupportedWallets;
	custodialWalletSettings?: CustodialSettings;

	constructor({
		account,
		network,
		mirrorNode,
		rpcNode,
		wallet,
		custodialWalletSettings,
	}: {
		account?: RequestAccount;
		network: Environment;
		mirrorNode: MirrorNode;
		rpcNode: JsonRpcRelay;
		wallet: SupportedWallets;
		custodialWalletSettings?: CustodialSettings;
	}) {
		super({
			account: Validation.checkAccount(),
			wallet: Validation.checkString({ emptyCheck: true }),
		});
		this.account = account;
		this.network = network;
		this.mirrorNode = mirrorNode;
		this.rpcNode = rpcNode;
		this.wallet = wallet;
		this.custodialWalletSettings = custodialWalletSettings;
	}
}
