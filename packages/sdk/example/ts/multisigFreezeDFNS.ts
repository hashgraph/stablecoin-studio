import {
	Network,
	InitializationRequest,
	ConnectRequest,
	SupportedWallets,
	StableCoin,
	Role,
	StableCoinRole,
	CreateRequest,
	TokenSupplyType,
	GrantRoleRequest,
	FreezeAccountRequest,
	SignTransactionRequest,
} from '@hashgraph/stablecoin-npm-sdk';
import type { DFNSConfigRequest } from '@hashgraph/stablecoin-npm-sdk';
import {
	AccountId,
	Client,
	PrivateKey,
	Status,
	TokenAssociateTransaction,
	TokenId,
} from '@hiero-ledger/sdk';
import * as fs from 'fs';

require('dotenv').config({ path: __dirname + '/../../.env' });

// Resolves a value that can be either a raw key string or a path to a key file.
const resolveKeyOrPath = (value: string | undefined): string | undefined => {
	if (!value) return undefined;
	if (fs.existsSync(value)) return fs.readFileSync(value, 'utf8').trim();
	return value;
};

// === Deployer & signing account (CLIENT wallet) ===
const DEPLOYER_ACCOUNT_ID = process.env.MY_ACCOUNT_ID!;
const DEPLOYER_PRIVATE_KEY = process.env.MY_PRIVATE_KEY_ECDSA!;

// === Infrastructure ===
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS!;
const RESOLVER_ADDRESS = process.env.RESOLVER_ADDRESS!;
const BACKEND_URL = process.env.BACKEND_URL ?? 'http://127.0.0.1:3001/api/transactions/';
const CONSENSUS_NODE_URL = process.env.CONSENSUS_NODE_URL ?? '34.94.106.61:50211';
const CONSENSUS_NODE_ID = process.env.CONSENSUS_NODE_ID ?? '0.0.3';

// === DFNS custodial wallet settings ===
const DFNS_AUTH_TOKEN = process.env.DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN!;
const DFNS_CREDENTIAL_ID = process.env.DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID!;
const DFNS_PRIVATE_KEY = resolveKeyOrPath(
	process.env.DFNS_SERVICE_ACCOUNT_PRIVATE_KEY_OR_PATH ??
	process.env.DFNS_SERVICE_ACCOUNT_PRIVATE_KEY_PATH ??
	process.env.DFNS_SERVICE_ACCOUNT_PRIVATE_KEY,
)!;
const DFNS_APP_ORIGIN = process.env.DFNS_APP_ORIGIN!;
const DFNS_APP_ID = process.env.DFNS_APP_ID!;
const DFNS_BASE_URL = process.env.DFNS_BASE_URL ?? process.env.DFNS_TEST_URL!;
const DFNS_WALLET_ID = process.env.DFNS_WALLET_ID!;
const DFNS_WALLET_PUBLIC_KEY = process.env.DFNS_WALLET_PUBLIC_KEY!;
// The Hedera account ID that DFNS controls (used as the connected wallet identity)
const DFNS_HEDERA_ACCOUNT_ID = process.env.DFNS_HEDERA_ACCOUNT_ID!;
// The multisig account created by createDFNSMultisigAccount.ts (KeyList includes DFNS key)
const DFNS_MULTISIG_ACCOUNT_ID = process.env.DFNS_MULTISIG_ACCOUNT_ID!;

// === Validate required env vars before doing anything ===
const REQUIRED_ENV: Record<string, string | undefined> = {
	MY_ACCOUNT_ID: DEPLOYER_ACCOUNT_ID,
	MY_PRIVATE_KEY_ECDSA: DEPLOYER_PRIVATE_KEY,
	FACTORY_ADDRESS,
	RESOLVER_ADDRESS,
	DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN: DFNS_AUTH_TOKEN,
	DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID: DFNS_CREDENTIAL_ID,
	'DFNS_SERVICE_ACCOUNT_PRIVATE_KEY(_OR_PATH)': DFNS_PRIVATE_KEY,
	DFNS_APP_ORIGIN,
	DFNS_APP_ID,
	'DFNS_BASE_URL or DFNS_TEST_URL': DFNS_BASE_URL,
	DFNS_WALLET_ID,
	DFNS_WALLET_PUBLIC_KEY,
	DFNS_HEDERA_ACCOUNT_ID,
	DFNS_MULTISIG_ACCOUNT_ID,
};
const missing = Object.entries(REQUIRED_ENV)
	.filter(([, v]) => !v)
	.map(([k]) => k);
if (missing.length) {
	console.error(`Missing required env vars:\n  ${missing.join('\n  ')}`);
	process.exit(1);
}

const consensusNodes = [{ url: CONSENSUS_NODE_URL, nodeId: CONSENSUS_NODE_ID }];

const mirrorNodeConfig = {
	name: 'Testnet Mirror Node',
	network: 'testnet',
	baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/',
	apiKey: '',
	headerName: '',
	selected: true,
};

const RPCNodeConfig = {
	name: 'HashIO',
	network: 'testnet',
	baseUrl: 'https://testnet.hashio.io/api',
	apiKey: '',
	headerName: '',
	selected: true,
};

const dfnsCustodialSettings: DFNSConfigRequest = {
	authorizationToken: DFNS_AUTH_TOKEN,
	credentialId: DFNS_CREDENTIAL_ID,
	serviceAccountPrivateKey: DFNS_PRIVATE_KEY,
	urlApplicationOrigin: DFNS_APP_ORIGIN,
	applicationId: DFNS_APP_ID,
	baseUrl: DFNS_BASE_URL,
	walletId: DFNS_WALLET_ID,
	hederaAccountId: DFNS_HEDERA_ACCOUNT_ID,
	publicKey: DFNS_WALLET_PUBLIC_KEY,
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const retry = async <T>(
	fn: () => Promise<T>,
	label: string,
	intervalMs = 5000,
	maxAttempts = 12,
): Promise<T> => {
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (err: any) {
			if (attempt === maxAttempts) throw err;
			console.log(`  [${label}] attempt ${attempt} failed, retrying in ${intervalMs / 1000}s...`);
			await wait(intervalMs);
		}
	}
	throw new Error(`${label} exhausted all retries`);
};

const connectDeployer = () =>
	Network.connect(
		new ConnectRequest({
			account: {
				accountId: DEPLOYER_ACCOUNT_ID,
				privateKey: { key: DEPLOYER_PRIVATE_KEY, type: 'ECDSA' },
			},
			network: 'custom',
			mirrorNode: mirrorNodeConfig,
			rpcNode: RPCNodeConfig,
			wallet: SupportedWallets.CLIENT,
			consensusNodes,
		}),
	);

// Connect as the DFNS-controlled multisig account to initiate the freeze (creates backend tx)
const connectDfnsMultisig = () =>
	Network.connect(
		new ConnectRequest({
			account: { accountId: DFNS_MULTISIG_ACCOUNT_ID },
			network: 'custom',
			mirrorNode: mirrorNodeConfig,
			rpcNode: RPCNodeConfig,
			wallet: SupportedWallets.MULTISIG,
			consensusNodes,
		}),
	);

// Connect as DFNS custodial wallet to sign the pending backend tx
const connectDfns = () =>
	Network.connect(
		new ConnectRequest({
			network: 'custom',
			mirrorNode: mirrorNodeConfig,
			rpcNode: RPCNodeConfig,
			wallet: SupportedWallets.DFNS,
			custodialWalletSettings: dfnsCustodialSettings,
			consensusNodes,
		}),
	);

const main = async () => {
	// ── Init ────────────────────────────────────────────────────────────────
	await Network.init(
		new InitializationRequest({
			network: 'custom',
			mirrorNode: mirrorNodeConfig,
			rpcNode: RPCNodeConfig,
			configuration: { factoryAddress: FACTORY_ADDRESS, resolverAddress: RESOLVER_ADDRESS },
			consensusNodes,
			backend: { url: BACKEND_URL },
		}),
	);

	// ── Phase 1: Deploy stablecoin ──────────────────────────────────────────
	console.log('\n[1/4] Deploying stablecoin...');
	await connectDeployer();

	const stableCoin = (await StableCoin.create(
		new CreateRequest({
			name: 'DFNSMultisigFreezeTest',
			symbol: 'DMFT',
			decimals: 6,
			initialSupply: '1000',
			freezeKey: { key: 'null', type: 'null' },
			kycKey: { key: 'null', type: 'null' },
			wipeKey: { key: 'null', type: 'null' },
			pauseKey: { key: 'null', type: 'null' },
			feeScheduleKey: { key: 'null', type: 'null' },
			supplyType: TokenSupplyType.INFINITE,
			createReserve: false,
			grantKYCToOriginalSender: true,
			burnRoleAccount: DEPLOYER_ACCOUNT_ID,
			wipeRoleAccount: DEPLOYER_ACCOUNT_ID,
			rescueRoleAccount: DEPLOYER_ACCOUNT_ID,
			pauseRoleAccount: DEPLOYER_ACCOUNT_ID,
			freezeRoleAccount: DEPLOYER_ACCOUNT_ID,
			deleteRoleAccount: DEPLOYER_ACCOUNT_ID,
			kycRoleAccount: DEPLOYER_ACCOUNT_ID,
			cashInRoleAccount: DEPLOYER_ACCOUNT_ID,
			feeRoleAccount: DEPLOYER_ACCOUNT_ID,
			cashInRoleAllowance: '0',
			proxyOwnerAccount: DEPLOYER_ACCOUNT_ID,
			configId: '0x0000000000000000000000000000000000000000000000000000000000000002',
			configVersion: 1,
		}),
	)) as { coin: any; reserve: any };

	const tokenId: string = stableCoin.coin.tokenId.toString();
	console.log(`  Stablecoin deployed: ${tokenId}`);
	await wait(5000);

	// ── Phase 2: Associate multisig account to token (deployer pays, deployer signs) ──
	// The multisig account is 1-of-2, so the deployer key alone satisfies the threshold.
	console.log('\n[2/4] Associating DFNS multisig account to token...');
	const hederaClient = Client.forNetwork(
		Object.fromEntries(consensusNodes.map((n) => [n.url, n.nodeId])),
	).setOperator(DEPLOYER_ACCOUNT_ID, PrivateKey.fromStringECDSA(DEPLOYER_PRIVATE_KEY));

	const associateTx = await new TokenAssociateTransaction()
		.setAccountId(AccountId.fromString(DFNS_MULTISIG_ACCOUNT_ID))
		.setTokenIds([TokenId.fromString(tokenId)])
		.freezeWith(hederaClient)
		.sign(PrivateKey.fromStringECDSA(DEPLOYER_PRIVATE_KEY));

	const associateResponse = await associateTx.execute(hederaClient);
	const receipt = await associateResponse.getReceipt(hederaClient);
	if (receipt.status !== Status.Success) {
		throw new Error(`Association failed: ${receipt.status.toString()}`);
	}
	console.log('  Association done.');
	await wait(5000);

	// ── Phase 3: Grant freeze role to the DFNS multisig account (the freeze caller) ──
	console.log('\n[3/4] Granting freeze role to DFNS multisig account...');
	await Role.grantRole(
		new GrantRoleRequest({
			targetId: DFNS_MULTISIG_ACCOUNT_ID,
			tokenId,
			role: StableCoinRole.FREEZE_ROLE,
		}),
	);
	console.log('  Freeze role granted.');
	await wait(5000);

	// ── Phase 4: Freeze via multisig → DFNS signs ────────────────────────────
	// Step 4a: connect as the DFNS multisig account to create the pending backend tx
	console.log('\n[4/4] Submitting freeze via DFNS multisig...');
	await connectDfnsMultisig();

	const startDate = new Date(Date.now() + 1 * 60 * 1000).toISOString();
	const freezeResult = await retry<{ transactionId?: string }>(
		() =>
			StableCoin.freeze(
				new FreezeAccountRequest({ tokenId, targetId: DFNS_MULTISIG_ACCOUNT_ID, startDate }),
			) as Promise<{ transactionId?: string }>,
		'freeze',
	);
	const freezeTxId = freezeResult.transactionId!;
	console.log(`  Backend tx: ${freezeTxId}`);

	// Step 4b: connect as DFNS custodial wallet to sign the pending tx
	await connectDfns();
	await StableCoin.signTransaction(new SignTransactionRequest({ transactionId: freezeTxId }));
	console.log('  Signature stored by DFNS. Waiting for autoSubmit...');

	process.exit(0);
};

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
