import * as sdk from '@hashgraph/sdk';
export class HashConnectProvider {
    constructor(networkName, hashconnect, topicId, accountToSign) {
        this.hashconnect = hashconnect;
        this.network = networkName;
        this.client = sdk.Client.forName(networkName);
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
    getAccountBalance(accountId) {
        return new sdk.AccountBalanceQuery()
            .setAccountId(accountId)
            .execute(this.client);
    }
    getAccountInfo(accountId) {
        return new sdk.AccountInfoQuery()
            .setAccountId(accountId)
            .execute(this.client);
    }
    getAccountRecords(accountId) {
        return new sdk.AccountRecordsQuery()
            .setAccountId(accountId)
            .execute(this.client);
    }
    getTransactionReceipt(transactionId) {
        return new sdk.TransactionReceiptQuery()
            .setTransactionId(transactionId)
            .execute(this.client);
    }
    waitForReceipt(response) {
        return new sdk.TransactionReceiptQuery()
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
        const res = await this.hashconnect.sendTransaction(this.topicId, transaction);
        const response = res.response;
        return response;
        throw new Error(`We only know how to forward Transactions and Queries.`);
    }
    getBytesOf(request) {
        const transaction = request;
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
//# sourceMappingURL=provider.js.map