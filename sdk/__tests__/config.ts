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

export const ENVIRONMENT = 'testnet';
export const HEDERA_ERC20_ADDRESS = process.env.HEDERA_ERC20_ADDRESS ?? '';
export const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS ?? '';
export const CLIENT_PRIVATE_KEY_ECDSA = new PrivateKey({
	key: '9f3243750c56fa6856e2acc5cc5438883e8cab089b836112dbef9a5a449ca9be',
	type: 'ECDSA',
});
export const CLIENT_PUBLIC_KEY_ECDSA = new PublicKey({
	key: '030e48276f9d1ebc6c9c57c3bbdc0aebbf58d0ab4986531a9a97f0290b452caffe',
	type: 'ECDSA',
});
export const CLIENT_EVM_ADDRESS_ECDSA =
	'0x85d7f8d07d13da6652111fbff5d1ad234f97e214';
export const CLIENT_ACCOUNT_ID_ECDSA = '0.0.49071855';
export const CLIENT_ACCOUNT_ECDSA: Account = new Account({
	id: CLIENT_ACCOUNT_ID_ECDSA,
	evmAddress: CLIENT_EVM_ADDRESS_ECDSA,
	privateKey: CLIENT_PRIVATE_KEY_ECDSA,
	publicKey: CLIENT_PUBLIC_KEY_ECDSA,
});
export const HEDERA_ID_ACCOUNT_ECDSA = HederaId.from(CLIENT_ACCOUNT_ID_ECDSA);

export const CLIENT_PRIVATE_KEY_ED25519 = new PrivateKey({
	key: 'f6392a8242bce3be5bf69fc607a153e65c99bf4b39126f1d41059b00c49ee318',
	type: 'ED25519',
});
export const CLIENT_PUBLIC_KEY_ED25519 = new PublicKey({
	key: 'b547baa785fe8c9a89c0a494d7ee65ac1bd0529020f985a4c31c3d09eb99142d',
	type: 'ED25519',
});
export const CLIENT_EVM_ADDRESS_ED25519 =
	'0x0000000000000000000000000000000000001e9f';
export const CLIENT_ACCOUNT_ID_ED25519 = '0.0.7839';
export const CLIENT_ACCOUNT_ED25519: Account = new Account({
	id: CLIENT_ACCOUNT_ID_ED25519,
	evmAddress: CLIENT_EVM_ADDRESS_ED25519,
	privateKey: CLIENT_PRIVATE_KEY_ED25519,
	publicKey: CLIENT_PUBLIC_KEY_ED25519,
});
export const HEDERA_ID_ACCOUNT_ED25519 = HederaId.from(
	CLIENT_ACCOUNT_ID_ED25519,
);
