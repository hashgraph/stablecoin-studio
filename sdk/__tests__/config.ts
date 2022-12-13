import Account from '../src/domain/context/account/Account.js';
import PrivateKey from '../src/domain/context/account/PrivateKey.js';
import PublicKey from '../src/domain/context/account/PublicKey.js';
import { HederaId } from '../src/domain/context/shared/HederaId.js';

export const ENVIRONMENT = 'testnet';

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
	key: 'e46c3f8d95d91c55a09a964b35cdec0e7bf22b183e3f6c3404bd7d75f361cb6b',
	type: 'ED25519',
});
export const CLIENT_PUBLIC_KEY_ED25519 = new PublicKey({
	key: '873823c7692e185212b5f418aeb4c9cef8e6b35e14fd72c6cda57afcbab2045c',
	type: 'ED25519',
});
export const CLIENT_EVM_ADDRESS_ED25519 =
	'0x0000000000000000000000000000000002ecc6ee';
export const CLIENT_ACCOUNT_ID_ED25519 = '0.0.49071854';
export const CLIENT_ACCOUNT_ED25519: Account = new Account({
	id: CLIENT_ACCOUNT_ID_ED25519,
	evmAddress: CLIENT_EVM_ADDRESS_ED25519,
	privateKey: CLIENT_PRIVATE_KEY_ED25519,
	publicKey: CLIENT_PUBLIC_KEY_ED25519,
});
export const HEDERA_ID_ACCOUNT_ED25519 = HederaId.from(
	CLIENT_ACCOUNT_ID_ED25519,
);
