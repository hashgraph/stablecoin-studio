
export enum KeyType {
	ECDSA = 'ECDSA',
	ED25519 = 'ED25519',
	NULL = 'null',
}

export default interface KeyProps {
	key: string;
	type: string;
}
