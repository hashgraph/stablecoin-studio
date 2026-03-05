import HederaStableCoinSDK from '@hashgraph/stablecoin-npm-sdk';

const main = async () => {
	console.log(JSON.stringify(HederaStableCoinSDK));
};

try {
	main();
} catch (error) {
	console.error(error);
}
