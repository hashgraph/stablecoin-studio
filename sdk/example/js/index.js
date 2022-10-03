const { EOAccount } = require('hedera-stable-coin-sdk');
const { HederaNetworkEnviroment } = require('hedera-stable-coin-sdk');
const { SDK, NetworkMode, HederaNetwork } = require('hedera-stable-coin-sdk');

const main = async () => {
	// Create instance
	const sdk = new SDK({
		mode: NetworkMode.EOA,
		network: new HederaNetwork(HederaNetworkEnviroment.TEST),
		options: {
			account: new EOAccount({
				accountId: '0.0.1',
				privateKey: '1234',
			}),
		},
	});
	// Init event listener
	const onInit = () => {
		console.log('SDK is initialized');
	};
	// Init the SDK
	await sdk.init({ onInit });
	// Subscribe to events
	sdk.onWalletExtensionFound(() => {
		console.log('Haspack wallet extension found');
	});
};

try {
	main();
} catch (error) {
	console.error(error);
}
