import {
	ConnectRequest,
	CreateRequest,
	FactoryAddressTestnet,
	HederaERC20AddressTestnet,
	InitializationRequest,
	Network,
	SDK,
	StableCoin,
	SupportedWallets,
} from '@hashgraph-dev/stablecoin-npm-sdk';

async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

const main = async (): Promise<void> => {
	// Configure app metadata
	SDK.appMetadata = {
		description: 'My first stable coin app',
		icon: '',
		name: 'Example TS App',
		url: 'https://localhost:3000',
		debugMode: false,
	};

	let isPaired: boolean = false;

	// Initialize and Connect to wallet, the init method returns
	// the wallets supported by the SDK in the current environment (client or server side)
	const supportedWallets = await Network.init(
		new InitializationRequest({
			network: 'testnet',
			events: {
				walletInit(data) {
					console.log('Wallet initialized ', data);
				},
				walletDisconnect(data) {
					console.log('Wallet disconnected ', data);
				},
				walletConnectionStatusChanged(data) {
					console.log('Wallet connection changed ', data);
				},
				walletPaired(data) {
					console.log('Wallet paired ', data);
					isPaired = true;
				},
				walletFound(data) {
					console.log('Wallet found ', data);
				},
			},
		}),
	);

	console.log('Supported wallets ', supportedWallets);

	// Make the connection to one of the supported wallets
	const connectionData = await Network.connect(
		new ConnectRequest({
			network: 'testnet',
			wallet: SupportedWallets.HASHPACK,
		}),
	);

	console.log('Connection data ', connectionData);

	// Create a stable coin
	const createRequest = new CreateRequest({
		stableCoinFactory: FactoryAddressTestnet,
		hederaERC20: HederaERC20AddressTestnet,
		decimals: 6,
		name: 'Test Coin',
		symbol: 'TC',
	});

	// Before submitting, any request can be validated, by a specific field, or all of them
	const nameValidation = createRequest.validate('name');
	const requestValidation = createRequest.validate();

	// Only submit if validation is passed
	if (requestValidation.length > 0) {
		requestValidation.forEach(({ errors, name }) =>
			console.error(
				'Validation failed for ',
				name,
				' with errors: ',
				errors,
			),
		);
		throw new Error('Validation failed');
	}

	// Send the request. Normally, you should wait until the wallet is paired, otherwise the request will fail.
	// Something like
	// --------
	// let tries = 3;
	// while (!isPaired && tries > 0) {
	// 	await sleep(10_000);
	// 	tries--;
	// }
	// if (tries <= 0) throw Error('Wallet was not paired in time');
	// --------
	const createdCoin = await StableCoin.create(createRequest);

	console.log('Created: ', createdCoin);
};

try {
	main();
} catch (error) {
	console.error(error);
}
