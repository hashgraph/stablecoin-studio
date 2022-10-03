import {
	SDK,
	NetworkMode,
	HederaNetwork,
	HederaNetworkEnviroment,
	EOAccount,
	AccountId,
	PrivateKey,
} from 'hedera-stable-coin-sdk';

const main = async (): Promise<void> => {
	// Create instance
	const sdk: SDK = new SDK({
		mode: NetworkMode.EOA,
		network: new HederaNetwork(HederaNetworkEnviroment.TEST),
		options: {
			account: new EOAccount({
				accountId: new AccountId('0.0.1'),
				privateKey: new PrivateKey('1234'),
			}),
		},
	});
	// Init event listener
	const onInit = (): void => {
		console.log('SDK is initialized');
	};
	// Init the SDK
	await sdk.init({ onInit });
	// Subscribe to events
	sdk.onWalletExtensionFound((): void => {
		console.log('Haspack wallet extension found');
	});
};

try {
	main();
} catch (error) {
	console.error(error);
}
