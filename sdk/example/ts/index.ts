import {
	ConnectRequest,
	CreateRequest,
	FactoryAddressTestnet,
	HederaTokenManagerAddressTestnet,
	InitializationRequest,
	Network,
	SDK,
	StableCoin,
	SupportedWallets,
} from '@hashgraph/stablecoin-npm-sdk';
import LogService from '../../app/service/LogService.js';

async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

const main = async (): Promise<void> => {
	// Configure app metadata
	SDK.appMetadata = {
		description: 'My first stablecoin app',
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
					LogService.logInfo('Wallet initialized ', data);
				},
				walletDisconnect(data) {
					LogService.logInfo('Wallet disconnected ', data);
				},
				walletConnectionStatusChanged(data) {
					LogService.logInfo(
						'Wallet connection status changed ',
						data,
					);
				},
				walletPaired(data) {
					LogService.logInfo('Wallet paired ', data);
					isPaired = true;
				},
				walletFound(data) {
					LogService.logInfo('Wallet found ', data);
				},
			},
		}),
	);

	LogService.logInfo(
		'Supported wallets: ',
		JSON.stringify(supportedWallets, null, 2),
	);

	// Make the connection to one of the supported wallets
	const connectionData = await Network.connect(
		new ConnectRequest({
			network: 'testnet',
			wallet: SupportedWallets.HASHPACK,
		}),
	);

	LogService.logInfo('Connected to wallet: ', JSON.stringify(connectionData));

	// Create a stablecoin
	const createRequest = new CreateRequest({
		stableCoinFactory: FactoryAddressTestnet,
		hederaTokenManager: HederaTokenManagerAddressTestnet,
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

	LogService.logInfo('Created coin: ', JSON.stringify(createdCoin, null, 2));
};

try {
	main();
} catch (error) {
	console.error(error);
}
