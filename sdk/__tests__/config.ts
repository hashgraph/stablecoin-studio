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

import Account from '../src/domain/context/account/Account.js';
import PrivateKey from '../src/domain/context/account/PrivateKey.js';
import PublicKey from '../src/domain/context/account/PublicKey.js';
import { HederaId } from '../src/domain/context/shared/HederaId.js';
import { config } from 'dotenv';

config();

export const ENVIRONMENT = 'testnet';
export const HEDERA_TOKEN_MANAGER_ADDRESS =
	process.env.HEDERA_TOKEN_MANAGER_ADDRESS ?? '';
export const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS ?? '';
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
