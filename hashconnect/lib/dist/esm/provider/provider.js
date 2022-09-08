import { AccountBalanceQuery, AccountInfoQuery, AccountRecordsQuery, Client, TransactionReceiptQuery } from '@hashgraph/sdk';
export class HashConnectProvider {
    constructor(networkName, hashconnect, topicId, accountToSign) {
        this.hashconnect = hashconnect;
        this.network = networkName;
        this.client = Client.forName(networkName);
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
        return new AccountBalanceQuery()
            .setAccountId(accountId)
            .execute(this.client);
    }
    getAccountInfo(accountId) {
        return new AccountInfoQuery()
            .setAccountId(accountId)
            .execute(this.client);
    }
    getAccountRecords(accountId) {
        return new AccountRecordsQuery()
            .setAccountId(accountId)
            .execute(this.client);
    }
    getTransactionReceipt(transactionId) {
        return new TransactionReceiptQuery()
            .setTransactionId(transactionId)
            .execute(this.client);
    }
    waitForReceipt(response) {
        return new TransactionReceiptQuery()
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
//# sourceMappingURL=provider.js.map