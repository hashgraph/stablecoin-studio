/**
 * Creates a Hedera multisig account whose KeyList includes the DFNS wallet
 * public key (+ optionally the deployer key as a co-signer).
 *
 * The account is created with a 1-of-2 threshold so DFNS alone can sign,
 * but the deployer can also sign independently (useful for recovery).
 * Change `threshold` to 2 if you need both keys to sign every transaction.
 *
 * HOW TO RUN:
 *   npm run create-dfns-multisig-account
 *
 * After it prints the new account ID, set it in your .env:
 *   DFNS_MULTISIG_ACCOUNT_ID=0.0.XXXX
 */

import {
	AccountCreateTransaction,
	AccountId,
	Client,
	Hbar,
	KeyList,
	PrivateKey,
	PublicKey,
} from '@hiero-ledger/sdk';

require('dotenv').config({ path: __dirname + '/../../.env' });

const DEPLOYER_ACCOUNT_ID = process.env.MY_ACCOUNT_ID!;
const DEPLOYER_PRIVATE_KEY = process.env.MY_PRIVATE_KEY_ECDSA!;
const DFNS_WALLET_PUBLIC_KEY = process.env.DFNS_WALLET_PUBLIC_KEY!;

const CONSENSUS_NODE_URL = process.env.CONSENSUS_NODE_URL ?? '34.94.106.61:50211';
const CONSENSUS_NODE_ID = process.env.CONSENSUS_NODE_ID ?? '0.0.3';

// How many keys must sign: 1 = DFNS alone is enough, 2 = both must sign.
const THRESHOLD = 1;

async function main(): Promise<void> {
	if (!DEPLOYER_ACCOUNT_ID || !DEPLOYER_PRIVATE_KEY) {
		throw new Error('MY_ACCOUNT_ID and MY_PRIVATE_KEY_ECDSA must be set in .env');
	}
	if (!DFNS_WALLET_PUBLIC_KEY) {
		throw new Error('DFNS_WALLET_PUBLIC_KEY must be set in .env');
	}

	const deployerPrivKey = PrivateKey.fromStringECDSA(DEPLOYER_PRIVATE_KEY);
	const dfnsPublicKey = PublicKey.fromString(DFNS_WALLET_PUBLIC_KEY);

	// 1-of-2 KeyList: DFNS key + deployer key (threshold can be adjusted above)
	const keyList = new KeyList([dfnsPublicKey, deployerPrivKey.publicKey], THRESHOLD);

	const client = Client.forNetwork(
		Object.fromEntries([[CONSENSUS_NODE_URL, CONSENSUS_NODE_ID]]),
	).setOperator(AccountId.fromString(DEPLOYER_ACCOUNT_ID), deployerPrivKey);

	console.log(`Creating ${THRESHOLD}-of-2 multisig account...`);
	console.log(`  Key 1 (DFNS):     ${dfnsPublicKey.toString()}`);
	console.log(`  Key 2 (deployer): ${deployerPrivKey.publicKey.toString()}`);

	const tx = await new AccountCreateTransaction()
		.setKeyWithoutAlias(keyList)
		.setInitialBalance(new Hbar(0))
		.execute(client);

	const receipt = await tx.getReceipt(client);
	const newAccountId = receipt.accountId;

	if (!newAccountId) {
		throw new Error('Account creation failed — no accountId in receipt');
	}

	console.log(`\nMultisig account created: ${newAccountId.toString()}`);
	console.log(`\nAdd this to your .env:`);
	console.log(`  DFNS_MULTISIG_ACCOUNT_ID=${newAccountId.toString()}`);
	console.log(`\nThen update multisigFreezeDFNS.ts to use DFNS_MULTISIG_ACCOUNT_ID`);
	console.log(`as the targetId/accountId for association, role grant, and freeze.`);
}

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
