import {
	Network,
	InitializationRequest,
	CreateRequest,
	ConnectRequest,
	SupportedWallets,
	TokenSupplyType,
	StableCoin,
	RevokeRoleRequest,
	StableCoinRole,
	Role,
	HasRoleRequest,
	GrantRoleRequest,
} from '@hashgraph/stablecoin-npm-sdk';
import assert from 'node:assert';

// Load environment variables from .env file
console.log('__dirname:', __dirname);
require('dotenv').config({ path: __dirname + '/../../.env' });

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

const main = async () => {
	// Initialize the network and connect to the Hedera testnet
	await Network.init(
		new InitializationRequest({
			network: 'testnet',
			mirrorNode: mirrorNodeConfig,
			rpcNode: RPCNodeConfig,
			configuration: {
				factoryAddress: '0.0.6431833',
				resolverAddress: '0.0.6431794',
			},
		}),
	);

	// Define the account details for connecting to the network
	const account = {
		accountId: process.env.MY_ACCOUNT_ID!,
		privateKey: {
			key: process.env.MY_PRIVATE_KEY!,
			type: 'ED25519',
		},
	};

	// Connect to the network using the provided account
	await Network.connect(
		new ConnectRequest({
			account: account,
			network: 'testnet',
			mirrorNode: mirrorNodeConfig,
			rpcNode: RPCNodeConfig,
			wallet: SupportedWallets.CLIENT,
		}),
	);

	// Create a new stablecoin with the specified parameters
	const request = new CreateRequest({
		name: 'test',
		symbol: 'test',
		decimals: 6,
		initialSupply: '1000',
		freezeKey: {
			key: 'null',
			type: 'null',
		},
		kycKey: {
			key: 'null',
			type: 'null',
		},
		wipeKey: {
			key: 'null',
			type: 'null',
		},
		pauseKey: {
			key: 'null',
			type: 'null',
		},
		feeScheduleKey: {
			key: 'null',
			type: 'null',
		},
		supplyType: TokenSupplyType.INFINITE,
		createReserve: false,
		grantKYCToOriginalSender: true,
		burnRoleAccount: account.accountId.toString(),
		wipeRoleAccount: account.accountId.toString(),
		rescueRoleAccount: account.accountId.toString(),
		pauseRoleAccount: account.accountId.toString(),
		freezeRoleAccount: account.accountId.toString(),
		deleteRoleAccount: account.accountId.toString(),
		kycRoleAccount: account.accountId.toString(),
		cashInRoleAccount: account.accountId.toString(),
		feeRoleAccount: account.accountId.toString(),
		cashInRoleAllowance: '0',
		proxyOwnerAccount: account.accountId.toString(),
		configId:
			'0x0000000000000000000000000000000000000000000000000000000000000002',
		configVersion: 1,
	});

	// Create the stablecoin and log the result
	const stableCoin = await StableCoin.create(request);
	console.log('StableCoin created:', stableCoin);

	// Revoke the Wipe role from the account
	await Role.revokeRole(
		new RevokeRoleRequest({
			targetId: account.accountId.toString(),
			tokenId: stableCoin?.coin?.tokenId?.toString()!,
			role: StableCoinRole.WIPE_ROLE,
		}),
	);

	await new Promise((resolve) => setTimeout(resolve, 5000));

	// Check if the account has the Wipe role
	const noRole = await Role.hasRole(
		new HasRoleRequest({
			targetId: account.accountId.toString(),
			tokenId: stableCoin?.coin?.tokenId?.toString()!,
			role: StableCoinRole.WIPE_ROLE,
		}),
	);

	// Assert that the account does not have the Wipe role
	assert(noRole === false, 'Expected no role for the account, but found one');

	// Grant the Wipe role to the account
	await Role.grantRole(
		new GrantRoleRequest({
			targetId: account.accountId.toString(),
			tokenId: stableCoin?.coin?.tokenId?.toString()!,
			role: StableCoinRole.WIPE_ROLE,
		}),
	);

	await new Promise((resolve) => setTimeout(resolve, 5000));

	// Assert that the role was granted successfully
	const hasRole = await Role.hasRole(
		new HasRoleRequest({
			targetId: account.accountId.toString(),
			tokenId: stableCoin?.coin?.tokenId?.toString()!,
			role: StableCoinRole.WIPE_ROLE,
		}),
	);
	assert(hasRole === true, 'Expected role to be granted, but it was not');
	process.exit(0);
};

try {
	main();
} catch (error) {
	console.error(error);
}
