"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashConnectProvider = void 0;
const sdk_1 = require("@hashgraph/sdk");
class HashConnectProvider {
    constructor(networkName, hashconnect, topicId, accountToSign) {
        this.hashconnect = hashconnect;
        this.network = networkName;
        this.client = sdk_1.Client.forName(networkName);
        this.topicId = topicId;
        this.accountToSign = accountToSign;
    }
    getLedgerId() {
        return this.client.ledgerId;
    }
    getNetwork() {
        return this.client.network;
    }
    getMirrorNetwork() {
        throw new Error("Get Mirror Network not implemented in HashConnect provider");
        return [];
    }
    ;
    getAccountBalance(accountId) {
        return new sdk_1.AccountBalanceQuery()
            .setAccountId(accountId)
            .execute(this.client);
    }
    getAccountInfo(accountId) {
        return new sdk_1.AccountInfoQuery()
            .setAccountId(accountId)
            .execute(this.client);
    }
    getAccountRecords(accountId) {
        return new sdk_1.AccountRecordsQuery()
            .setAccountId(accountId)
            .execute(this.client);
    }
    getTransactionReceipt(transactionId) {
        return new sdk_1.TransactionReceiptQuery()
            .setTransactionId(transactionId)
            .execute(this.client);
    }
    waitForReceipt(response) {
        return new sdk_1.TransactionReceiptQuery()
            .setNodeAccountIds([response.nodeId])
            .setTransactionId(response.transactionId)
            .execute(this.client);
    }
    async call(request) {
        const transaction = {
            byteArray: this.getBytesOf(request),
            metadata: {
                accountToSign: this.accountToSign.toString(),
                returnTransaction: false,
            },
            topic: this.topicId,
        };
        let res = await this.hashconnect.sendTransaction(this.topicId, transaction);
        let response = res.response;
        return response;
        throw new Error(`We only know how to forward Transactions and Queries.`);
    }
    getBytesOf(request) {
        let transaction = request;
        let query;
        if (!transaction)
            query = request;
        if (!transaction && !query)
            throw new Error("Only Transactions and Queries can be serialized to be sent for signing by the HashPack wallet.");
        if (transaction)
            return request.toBytes();
        else
            return request.toBytes();
    }
}
exports.HashConnectProvider = HashConnectProvider;
//# sourceMappingURL=provider.js.map