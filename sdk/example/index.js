import HederaStableCoinSDK from "hedera-stable-coin-sdk";

const main = async () => {
    console.log(JSON.stringify(HederaStableCoinSDK));
}

try {
    main();
} catch (error) {
    console.error(error);
}