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
import {
	AccountId,
	Client,
	PrivateKey,
	Status,
	TokenAssociateTransaction,
	TokenId,
} from '@hiero-ledger/sdk';

require('dotenv').config({ path: __dirname + '/../../.env' });

// === Deployer & signing account (CLIENT wallet) ===
const DEPLOYER_ACCOUNT_ID = process.env.MY_ACCOUNT_ID!;
const DEPLOYER_PRIVATE_KEY = process.env.MY_PRIVATE_KEY_ECDSA!;

// === Multisig account (MULTISIG wallet — only for the freeze) ===
const MULTISIG_ACCOUNT_ID = process.env.MULTISIG_ACCOUNT_ID!;

// === Infrastructure ===
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS!;
const RESOLVER_ADDRESS = process.env.RESOLVER_ADDRESS!;
const BACKEND_URL = process.env.BACKEND_URL ?? 'http://127.0.0.1:3001/api/transactions/';
const CONSENSUS_NODE_URL = process.env.CONSENSUS_NODE_URL ?? '34.94.106.61:50211';
const CONSENSUS_NODE_ID = process.env.CONSENSUS_NODE_ID ?? '0.0.3';

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

const connectMultisig = () =>
	Network.connect(
		new ConnectRequest({
			account: { accountId: MULTISIG_ACCOUNT_ID },
			network: 'custom',
			mirrorNode: mirrorNodeConfig,
			rpcNode: RPCNodeConfig,
			wallet: SupportedWallets.MULTISIG,
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
			name: 'MultisigFreezeTest',
			symbol: 'MFT',
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

	// ── Phase 2: Associate multisig account to token (direct HTS tx) ────────
	console.log('\n[2/4] Associating multisig account to token...');
	const hederaClient = Client.forNetwork(
		Object.fromEntries(consensusNodes.map((n) => [n.url, n.nodeId])),
	).setOperator(DEPLOYER_ACCOUNT_ID, PrivateKey.fromStringECDSA(DEPLOYER_PRIVATE_KEY));

	const associateTx = await new TokenAssociateTransaction()
		.setAccountId(AccountId.fromString(MULTISIG_ACCOUNT_ID))
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

	// ── Phase 3: Grant freeze role to multisig account (CLIENT/deployer) ────
	console.log('\n[3/4] Granting freeze role to multisig account...');
	await Role.grantRole(
		new GrantRoleRequest({
			targetId: MULTISIG_ACCOUNT_ID,
			tokenId,
			role: StableCoinRole.FREEZE_ROLE,
		}),
	);
	console.log('  Freeze role granted.');
	await wait(5000);

	// ── Phase 4: Freeze via multisig (MULTISIG → sign → autoSubmit) ─────────
	console.log('\n[4/4] Submitting freeze via multisig...');
	await connectMultisig();

	const startDate = new Date(Date.now() + 1 * 60 * 1000).toISOString();
	const freezeResult = await retry(
		() => StableCoin.freeze(new FreezeAccountRequest({ tokenId, targetId: MULTISIG_ACCOUNT_ID, startDate })),
		'freeze',
	);
	const freezeTxId = freezeResult.transactionId!;
	console.log(`  Backend tx: ${freezeTxId}`);

	await connectDeployer();
	await StableCoin.signTransaction(new SignTransactionRequest({ transactionId: freezeTxId }));
	console.log('  Signature stored. Waiting for autoSubmit...');

	process.exit(0);
};

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
