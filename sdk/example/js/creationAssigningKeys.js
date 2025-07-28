const {
	Network,
	InitializationRequest,
	CreateRequest,
	ConnectRequest,
	SupportedWallets,
	TokenSupplyType,
	StableCoin,
} = require('@hashgraph/stablecoin-npm-sdk');

// Load environment variables from .env file
require('dotenv').config({ path: __dirname + '/../.env' });

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
		accountId: process.env.MY_ACCOUNT_ID,
		privateKey: {
			key: process.env.MY_PRIVATE_KEY,
			type: 'ED25519',
		},
	};

	// Connect to the network using the provided account
	const connection = await Network.connect(
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
			key: connection.account.publicKey.key,
			type: 'ED25519',
		},
		kycKey: {
			key: connection.account.publicKey.key,
			type: 'ED25519',
		},
		wipeKey: {
			key: connection.account.publicKey.key,
			type: 'ED25519',
		},
		pauseKey: {
			key: connection.account.publicKey.key,
			type: 'ED25519',
		},
		supplyType: TokenSupplyType.INFINITE,
		createReserve: false,
		grantKYCToOriginalSender: true,
		burnRoleAccount: account.accountId.toString(),
		wipeRoleAccount: '0.0.0',
		rescueRoleAccount: account.accountId.toString(),
		pauseRoleAccount: '0.0.0',
		freezeRoleAccount: '0.0.0',
		deleteRoleAccount: account.accountId.toString(),
		kycRoleAccount: account.accountId.toString(),
		cashInRoleAccount: account.accountId.toString(),
		feeRoleAccount: '0.0.0',
		cashInRoleAllowance: '0',
		proxyOwnerAccount: account.accountId.toString(),
		configId:
			'0x0000000000000000000000000000000000000000000000000000000000000002',
		configVersion: 1,
	});

	// Create the stablecoin and log the result
	const stableCoin = await StableCoin.create(request);
	console.log('StableCoin created:', stableCoin);
};

try {
	main();
} catch (error) {
	console.error(error);
}
