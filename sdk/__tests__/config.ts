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

// MultiSig Account associated to keys CLIENT_PRIVATE_KEY_ECDSA and CLIENT_PRIVATE_KEY_ED25519 ---
export const MULTISIG_ACCOUNT_ADDRESS = '0.0.3792838';

export const ENVIRONMENT = 'testnet';

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

export const CLIENT_PRIVATE_KEY_ECDSA_2 = new PrivateKey({
	key: process.env.CLIENT_PRIVATE_KEY_ECDSA_2 ?? '',
	type: 'ECDSA',
});
export const CLIENT_PUBLIC_KEY_ECDSA_2 = new PublicKey({
	key: process.env.CLIENT_PUBLIC_KEY_ECDSA_2 ?? '',
	type: 'ECDSA',
});
export const CLIENT_EVM_ADDRESS_ECDSA_2 =
	process.env.CLIENT_EVM_ADDRESS_ECDSA ?? '';
export const CLIENT_ACCOUNT_ID_ECDSA_2 =
	process.env.CLIENT_ACCOUNT_ID_ECDSA ?? '';
export const CLIENT_ACCOUNT_ECDSA_2: Account = new Account({
	id: CLIENT_ACCOUNT_ID_ECDSA_2,
	evmAddress: CLIENT_EVM_ADDRESS_ECDSA_2,
	privateKey: CLIENT_PRIVATE_KEY_ECDSA_2,
	publicKey: CLIENT_PUBLIC_KEY_ECDSA_2,
});
export const HEDERA_ID_ACCOUNT_ECDSA_2 = HederaId.from(
	CLIENT_ACCOUNT_ID_ECDSA_2,
);

//* Smart Contracts
export const HEDERA_TOKEN_MANAGER_ADDRESS =
	process.env.HEDERA_TOKEN_MANAGER_ADDRESS ?? '';
export const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS ?? '';

//* Infrastructure
export const BACKEND_NODE = {
	name: 'testBackendNode',
	baseUrl:
		process.env.BACKEND_NODE_BASE_URL ??
		'http://localhost:3000/api/transactions/',
};

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

const FIREBLOCKS_API_KEY = 'FIREBLOCKS_API_KEY';
const FIREBLOCKS_API_SECRET_KEY_PATH = 'FIREBLOCKS_API_SECRET_KEY_PATH';
const FIREBLOCKS_BASE_URL = 'FIREBLOCKS_BASE_URL';
const FIREBLOCKS_VAULT_ACCOUNT_ID = 'FIREBLOCKS_VAULT_ACCOUNT_ID';
const FIREBLOCKS_ASSET_ID = 'FIREBLOCKS_ASSET_ID';

export const FIREBLOCKS_SETTINGS = {
	apiKey: FIREBLOCKS_API_KEY ?? '',
	apiSecretKeyPath: FIREBLOCKS_API_SECRET_KEY_PATH ?? '',
	baseUrl: FIREBLOCKS_BASE_URL ?? '',
	vaultAccountId: FIREBLOCKS_VAULT_ACCOUNT_ID ?? '',
	assetId: FIREBLOCKS_ASSET_ID ?? '',
	hederaAccountId: process.env.FIREBLOCKS_HEDERA_ACCOUNT_ID ?? '',
	hederaAccountPublicKey: process.env.FIREBLOCKS_HEDERA_PUBLIC_KEY ?? '',
};

const DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN =
	'DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN';
const DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID = 'DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID';
const DFNS_SERVICE_ACCOUNT_PRIVATE_KEY_PATH =
	'DFNS_SERVICE_ACCOUNT_PRIVATE_KEY_PATH';
const DFNS_APP_ORIGIN = 'DFNS_APP_ORIGIN';
const DFNS_APP_ID = 'DFNS_APP_ID';
const DFNS_BASE_URL = 'DFNS_BASE_URL';
const DFNS_WALLET_ID = 'DFNS_WALLET_ID';

export const DFNS_SETTINGS = {
	authorizationToken: DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN,
	credentialId: DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID,
	serviceAccountPrivateKeyPath: DFNS_SERVICE_ACCOUNT_PRIVATE_KEY_PATH,
	urlApplicationOrigin: DFNS_APP_ORIGIN,
	applicationId: DFNS_APP_ID,
	baseUrl: DFNS_BASE_URL,
	walletId: DFNS_WALLET_ID,
	hederaAccountId: process.env.DFNS_HEDERA_ACCOUNT_ID ?? '',
	hederaAccountPublicKey: process.env.DFNS_WALLET_PUBLIC_KEY ?? '',
};

const AWS_KMS_ACCESS_KEY_ID = 'AWS_ACCESS_KEY_ID';
const AWS_KMS_SECRET_ACCESS_KEY = 'AWS_SECRET_ACCESS_KEY';
const AWS_KMS_REGION = 'AWS_KMS_REGION';
const AWS_KMS_KEY_ID = 'AWS_KMS_KEY_ID';

export const AWS_KMS_SETTINGS = {
	accessKeyId: AWS_KMS_ACCESS_KEY_ID,
	secretAccessKey: AWS_KMS_SECRET_ACCESS_KEY,
	region: AWS_KMS_REGION,
	kmsKeyId: AWS_KMS_KEY_ID,
	hederaAccountId: process.env.AWS_KMS_HEDERA_ACCOUNT_ID ?? '',
	hederaAccountPublicKey: process.env.AWS_KMS_HEDERA_PUBLIC_KEY ?? '',
};

export const URL = 'http://example.com/';

export const TRANSACTION = {
	transaction_message: 'transaction_message',
	description: 'description',
	hedera_account_id: '0.0.1',
	key_list: ['key1', 'key2'],
	threshold: 2,
	network: 'testnet',
	originHeader: 'http://localhost:3000',
	startDate: '2024-04-25T00:00:00.000Z',
};

export const SIGNATURE = {
	transactionId: 'transactionId',
	transactionSignature: 'transactionSignature',
	publicKey: 'publicKey',
};

export const UPDATE = {
	transactionId: 'transactionId',
	status: 'EXECUTED',
};

export const DELETE = {
	transactionId: 'transactionId',
	originHeader: 'http://localhost:3000',
};

export const GET_TRANSACTIONS = {
	page: 1,
	limit: 10,
	network: 'testnet',
	publicKey: 'publicKey',
	status: 'status',
	accountId: '0.0.1',
};

export const PAGINATION = {
	totalItems: 560,
	itemCount: 10,
	itemsPerPage: 10,
	totalPages: 56,
	currentPage: 1,
};

export const GET_TRANSACTION = {
	id: 'id',
	transaction_message: 'transaction_message',
	description: 'description',
	status: 'status',
	threshold: 3,
	key_list: ['key_1', 'key_2'],
	signed_keys: ['signed_key_1', 'signed_key_2'],
	signatures: ['signature_1', 'signature_2'],
	network: 'testnet',
	hedera_account_id: '0.0.1',
};

export const DECIMALS = 2;

export const PROXY_CONTRACT_ID = '0.0.1';
export const PROXY_ADMIN_CONTRACT_ID = '0.0.2';
export const MAX_SUPPLY = '100000000000';
export const INITIAL_SUPPLY = '1000000000';
export const INITIAL_HBAR_SUPPLY = '10000000000000000000';
export const EXPIRATION_TIMESTAMP = '1759047276000000000';
export const AUTO_RENEW_ACCOUNT = '0.0.5';
export const RESERVE_AMOUNT = '100000000000000';
export const RESERVE_ADDRESS = '0.0.7654321';
