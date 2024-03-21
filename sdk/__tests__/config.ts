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

import Account from '../src/domain/context/account/Account.js';
import PrivateKey from '../src/domain/context/account/PrivateKey.js';
import PublicKey from '../src/domain/context/account/PublicKey.js';
import { HederaId } from '../src/domain/context/shared/HederaId.js';
import { config } from 'dotenv';
config();

export const ENVIRONMENT = 'previewnet';

export const CLIENT_PRIVATE_KEY_ECDSA = new PrivateKey({
	key: process.env.CLIENT_PRIVATE_KEY_ECDSA ?? '',
	type: 'ECDSA',
});
export const CLIENT_PUBLIC_KEY_ECDSA = new PublicKey({
	key: process.env.CLIENT_PUBLIC_KEY_ECDSA ?? '',
	type: 'ECDSA',
});
export const CLIENT_EVM_ADDRESS_ECDSA =
	process.env.CLIENT_EVM_ADDRESS_ECDSA ?? '';
export const CLIENT_ACCOUNT_ID_ECDSA =
	process.env.CLIENT_ACCOUNT_ID_ECDSA ?? '';
export const CLIENT_ACCOUNT_ECDSA: Account = new Account({
	id: CLIENT_ACCOUNT_ID_ECDSA,
	evmAddress: CLIENT_EVM_ADDRESS_ECDSA,
	privateKey: CLIENT_PRIVATE_KEY_ECDSA,
	publicKey: CLIENT_PUBLIC_KEY_ECDSA,
});
export const HEDERA_ID_ACCOUNT_ECDSA = HederaId.from(CLIENT_ACCOUNT_ID_ECDSA);

export const CLIENT_PRIVATE_KEY_ED25519 = new PrivateKey({
	key: process.env.CLIENT_PRIVATE_KEY_ED25519 ?? '',
	type: 'ED25519',
});
export const CLIENT_PUBLIC_KEY_ED25519 = new PublicKey({
	key: process.env.CLIENT_PUBLIC_KEY_ED25519 ?? '',
	type: 'ED25519',
});
export const CLIENT_EVM_ADDRESS_ED25519 =
	process.env.CLIENT_EVM_ADDRESS_ED25519 ?? '';
export const CLIENT_ACCOUNT_ID_ED25519 =
	process.env.CLIENT_ACCOUNT_ID_ED25519 ?? '';
export const CLIENT_ACCOUNT_ED25519: Account = new Account({
	id: CLIENT_ACCOUNT_ID_ED25519,
	evmAddress: CLIENT_EVM_ADDRESS_ED25519,
	privateKey: CLIENT_PRIVATE_KEY_ED25519,
	publicKey: CLIENT_PUBLIC_KEY_ED25519,
});
export const HEDERA_ID_ACCOUNT_ED25519 = HederaId.from(
	CLIENT_ACCOUNT_ID_ED25519,
);

export const CLIENT_PRIVATE_KEY_ED25519_2 = new PrivateKey({
	key: process.env.CLIENT_PRIVATE_KEY_ED25519_2 ?? '',
	type: 'ED25519',
});
export const CLIENT_PUBLIC_KEY_ED25519_2 = new PublicKey({
	key: process.env.CLIENT_PUBLIC_KEY_ED25519_2 ?? '',
	type: 'ED25519',
});
export const CLIENT_EVM_ADDRESS_ED25519_2 =
	process.env.CLIENT_EVM_ADDRESS_ED25519_2 ?? '';
export const CLIENT_ACCOUNT_ID_ED25519_2 =
	process.env.CLIENT_ACCOUNT_ID_ED25519_2 ?? '';
export const CLIENT_ACCOUNT_ED25519_2: Account = new Account({
	id: CLIENT_ACCOUNT_ID_ED25519_2,
	evmAddress: CLIENT_EVM_ADDRESS_ED25519_2,
	privateKey: CLIENT_PRIVATE_KEY_ED25519_2,
	publicKey: CLIENT_PUBLIC_KEY_ED25519_2,
});
export const HEDERA_ID_ACCOUNT_ED25519_2 = HederaId.from(
	CLIENT_ACCOUNT_ID_ED25519_2,
);

//* Smart Contracts
export const HEDERA_TOKEN_MANAGER_ADDRESS =
	process.env.HEDERA_TOKEN_MANAGER_ADDRESS ?? '';
export const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS ?? '';

//* Infrastructure
export const MIRROR_NODE = {
	name: 'testMirrorNode',
	baseUrl:
		process.env.MIRROR_NODE_BASE_URL ??
		'https://testnet.mirrornode.hedera.com/api/v1/',
};
export const RPC_NODE = {
	name: 'testrpcNode',
	baseUrl: process.env.RPC_NODE_BASE_URL ?? 'https://testnet.hashio.io/api',
};
/*
export const MIRROR_NODE = {
	name: 'previewMirrorNode',
	baseUrl:
		process.env.MIRROR_NODE_BASE_URL ??
		'https://previewnet.mirrornode.hedera.com/api/v1/',
};
export const RPC_NODE = {
	name: 'previewrpcNode',
	baseUrl: process.env.RPC_NODE_BASE_URL ?? 'https://previewnet.hashio.io/api',
};*/

export const FIREBLOCKS_SETTINGS = {
	apiKey: process.env.FIREBLOCKS_API_KEY ?? '',
	apiSecretKeyPath: process.env.FIREBLOCKS_API_SECRET_KEY_PATH ?? '',
	baseUrl: process.env.FIREBLOCKS_BASE_URL ?? '',
	vaultAccountId: process.env.FIREBLOCKS_VAULT_ACCOUNT_ID ?? '',
	assetId: process.env.FIREBLOCKS_ASSET_ID ?? '',
	hederaAccountId: process.env.FIREBLOCKS_HEDERA_ACCOUNT_ID ?? '',
	hederaAccountPublicKey:
		process.env.FIREBLOCKS_HEDERA_ACCOUNT_CLIENT_PUBLIC_KEY_ED25519 ?? '',
};

export const DFNS_SETTINGS = {
	authorizationToken:
		process.env.DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN ?? '',
	credentialId: process.env.DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID ?? '',
	serviceAccountPrivateKeyPath:
		process.env.DFNS_SERVICE_ACCOUNT_PRIVATE_KEY_PATH ?? '',
	urlApplicationOrigin: process.env.DFNS_APP_ORIGIN ?? '',
	applicationId: process.env.DFNS_APP_ID ?? '',
	baseUrl: process.env.DFNS_BASE_URL ?? '',
	walletId: process.env.DFNS_WALLET_ID ?? '',
	hederaAccountId: process.env.DFNS_HEDERA_ACCOUNT_ID ?? '',
	hederaAccountPublicKey:
		process.env.DFNS_HEDERA_ACCOUNT_CLIENT_PUBLIC_KEY_ED25519 ?? '',
};
