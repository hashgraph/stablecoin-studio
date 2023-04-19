import HederaStableCoinSDK from '@hashgraph-dev/stablecoin-npm-sdk';

const main = async () => {
	console.log(JSON.stringify(HederaStableCoinSDK));
};

try {
	main();
} catch (error) {
	console.error(error);
}
