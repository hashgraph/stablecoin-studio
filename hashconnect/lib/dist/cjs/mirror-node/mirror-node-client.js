"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MirrorNodeClient = void 0;
class MirrorNodeClient {
    constructor(network) {
        this.url = "https://mainnet-public.mirrornode.hedera.com/";
        if (typeof fetch === "undefined") {
            throw new Error("fetch is not defined. Install a polyfill or use a compatible browser");
        }
        if (network === "testnet") {
            this.url = "https://testnet.mirrornode.hedera.com/";
        }
        else if (network === "previewnet") {
            this.url = "https://previewnet.mirrornode.hedera.com/";
        }
    }
    async getAccountInfo(accountId) {
        const accountInfo = await fetch(`${this.url}api/v1/accounts/${accountId}`, {
            method: "GET",
        });
        const accountInfoJson = await accountInfo.json();
        return accountInfoJson;
    }
}
exports.MirrorNodeClient = MirrorNodeClient;
//# sourceMappingURL=mirror-node-client.js.map